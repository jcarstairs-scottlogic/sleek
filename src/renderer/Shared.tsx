import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import duration from 'dayjs/plugin/duration';
import calendar from 'dayjs/plugin/calendar';
import weekday from 'dayjs/plugin/weekday';
import updateLocale from 'dayjs/plugin/updateLocale';
import { i18n } from './Settings/LanguageSelector';
dayjs.extend(relativeTime);
dayjs.extend(duration);
dayjs.extend(calendar);
dayjs.extend(weekday);
dayjs.extend(updateLocale);

const { store, ipcRenderer } = window.api;

export const handleFilterSelect = (key: string, name: string, values: string | string[] | null, filters: Filters | null, exclude: boolean) => {
  try {

    const updatedFilters: Filters = { ...filters };
    const filterList: Filter[] = updatedFilters[key] || [];

    const normalizedValues = typeof values === 'string' ? [values] : values;

    const filterIndex = filterList.findIndex((filter: Filter) => {
      return Array.isArray(normalizedValues) && Array.isArray(filter.values) ? 
        normalizedValues.every(v => filter.values.includes(v)) : 
        filter.values === normalizedValues;
    });

    if (filterIndex !== -1) {
      filterList.splice(filterIndex, 1);
    } else {
      filterList.push({ name, values: normalizedValues, exclude });
    }

    updatedFilters[key] = filterList;
    store.setFilters('attributes', updatedFilters);
  } catch (error: any) {
    console.error(error);
  }
};


export const handleLinkClick = (event: MouseEvent, url: string) => {
  event.preventDefault();
  event.stopPropagation();
  if(url) {
    ipcRenderer.send('openInBrowser', url)
  }
};

export const translatedAttributes = (t: typeof i18n.t) => {
  return {
    t: t('shared.attributeMapping.t'),
    due: t('shared.attributeMapping.due'),
    projects: t('shared.attributeMapping.projects'),
    contexts: t('shared.attributeMapping.contexts'),
    priority: t('shared.attributeMapping.priority'),
    rec: t('shared.attributeMapping.rec'),
    pm: t('shared.attributeMapping.pm'),
    created: t('shared.attributeMapping.created'),
    completed: t('shared.attributeMapping.completed'),
  }
};

export const friendlyDate = (group: FriendlyDateGroup | null, attributeKey: string, settings: Settings, t: typeof i18n.t) => {
  dayjs.updateLocale(settings.language, {
    weekStart: settings.weekStart,
  });

  switch (group) {
    case 'before-last-week':
      return [
        attributeKey === 'due'
          ? t('drawer.attributes.overdue')
          : t('drawer.attributes.elapsed'),
        t('drawer.attributes.beforeLastWeek'),
      ];
    case 'last-week':
      return [
        attributeKey === 'due'
          ? t('drawer.attributes.overdue')
          : t('drawer.attributes.elapsed'),
        t('drawer.attributes.lastWeek'),
      ];
    case 'yesterday':
      return [
        attributeKey === 'due'
          ? t('drawer.attributes.overdue')
          : t('drawer.attributes.elapsed'),
        t('drawer.attributes.yesterday'),
      ];
    case 'today':
      return [t('drawer.attributes.today')];
    case 'tomorrow':
      return [t('drawer.attributes.tomorrow')];
    case 'this-week':
      return [t('drawer.attributes.thisWeek')];
    case 'next-week':
      return [t('drawer.attributes.nextWeek')];
    case 'this-month':
      return [t('drawer.attributes.thisMonth')];
    case 'next-month':
      return [t('drawer.attributes.nextMonth')];
    case 'after-next-month':
      return [t('drawer.attributes.afterNextMonth')];
    default:
      return [];
  }
};

export const getDateAttributeKeys = () => (['due', 't', 'created', 'completed']);
