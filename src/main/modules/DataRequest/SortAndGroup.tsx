import dayjs from 'dayjs';
import { config } from '../../config';
import { getDateAttributes } from '../Attributes';
import { getFriendlyDateGroup } from '../Date';

function sortAndGroupTodoObjects(todoObjects: TodoObject[], sorting: Sorting[]): TodoGroup[] {
  const fileSorting: boolean = config.get('fileSorting');
  const showHidden: boolean = config.get('showHidden');

  function compareValues(a: any, b: any, invert: boolean): number {
    if (a === null && b === null) return 0;
    if (a === null) return 1;
    if (b === null) return -1;

    const strA = String(a);
    const strB = String(b);

    if (strA < strB) {
        return invert ? 1 : -1;
    }
    if (strA > strB) {
        return invert ? -1 : 1;
    }
    return 0;
  }

  function compareDates(a: TodoObjectDateProperty | null, b: TodoObjectDateProperty | null, invert: boolean): number {
    const dateA = a?.isoString ?? null;
    const dateB = b?.isoString ?? null;
    return compareValues(dateA, dateB, invert);
  }

  function applySorting(a: TodoObject, b: TodoObject, sorting: Sorting[]): number {
    for (const { value, invert } of sorting) {
      const isDateAttribute = Object.keys(getDateAttributes()).includes(value);

      const compareResult = isDateAttribute
        ? compareDates(a[value], b[value], invert)
        : compareValues(a[value], b[value], invert);

      if (compareResult !== 0) {
        return compareResult;
      }
    }
    return 0;
  }

  function getGroupKey(todoObject: TodoObject, attributeKey: string) {
    const useFriendlyDates = config.get('useHumanFriendlyDates');
    const isDateAttribute = Object.keys(getDateAttributes()).includes(attributeKey);
    const dateValue = dayjs(todoObject[attributeKey]?.isoString || null);
    const hasValidDateValue = dateValue.isValid();

    if (useFriendlyDates && isDateAttribute && hasValidDateValue) {
      return getFriendlyDateGroup(dateValue);
    }

    return todoObject[attributeKey];
  }

  function groupTodoObjectsByKey(todoObjects: TodoObject[], attributeKey: string) {
    const grouped: { [key: string]: TodoGroup } = {};
    for (const todoObject of todoObjects) {
      const group = todoObject[attributeKey];
      const groupKey = getGroupKey(todoObject, attributeKey);
      if (!grouped[groupKey]) {
        grouped[groupKey] = {
          title: todoObject[attributeKey],
          todoObjects: [],
          visible: false
        };
      }

      grouped[groupKey].todoObjects.push(todoObject);
      grouped[groupKey].visible = grouped[groupKey].todoObjects.some(todoObject => {
        return !todoObject.hidden || (showHidden && todoObject.hidden);
      });
    }
    return Object.values(grouped);
  }

  function sortTodoObjects(todoObjects: TodoObject[], sorting: Sorting[]): any {
    const { value } = sorting[0];
    const grouped = groupTodoObjectsByKey(todoObjects, value);
    return grouped;
  }

  if (fileSorting) {
    return [{
      title: '',
      todoObjects: todoObjects,
      visible: true
    }]
  }

  const sortedTodoObjects = [...todoObjects].sort((a, b) => applySorting(a, b, sorting));
  const sortedAndGroupedTodoObjects = sortTodoObjects(sortedTodoObjects, sorting);
  return sortedAndGroupedTodoObjects;
}

export { sortAndGroupTodoObjects };
