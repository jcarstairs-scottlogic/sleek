import { app } from 'electron';
import { Item } from 'jstodotxt';
import { config } from '../../config';
import { handleNotification } from '../Notifications';
import { extractSpeakingDates, getFriendlyDateGroup } from '../Date';
import dayjs, { type Dayjs } from 'dayjs';

let linesInFile: string[];
export const badge: Badge = { count: 0 };

function createTodoObject(lineNumber: number, string: string, attributeType?: string, attributeValue?: string): TodoObject {
  let content = string.replaceAll(/[\x10\r\n]/g, ' [LB] ');

  let JsTodoTxtObject = new Item(content);

  const extensions = JsTodoTxtObject.extensions();

  if(attributeType) {
    if(attributeType === 'priority') {
      const value = (attributeValue === '-') ? null : attributeValue;
      JsTodoTxtObject.setPriority(value);
    } else {
      if(!attributeValue) {
        JsTodoTxtObject.removeExtension(attributeType);
      } else {
        JsTodoTxtObject.setExtension(attributeType, attributeValue);
      }
    }
  }

  content = JsTodoTxtObject.toString().replaceAll(' [LB] ', String.fromCharCode(16));

  const body = JsTodoTxtObject.body().replaceAll(' [LB] ', ' ');

  const speakingDates = extractSpeakingDates(body);
  const due = makeDateProperty(dayjs(speakingDates['due:']?.date));
  const dueString = speakingDates['due:']?.string || null;
  const notify = speakingDates['due:']?.notify || false;
  const t = makeDateProperty(dayjs(speakingDates['t:']?.date));
  const tString = speakingDates['t:']?.string || null;
  const hidden = extensions.some(extension => extension.key === 'h' && extension.value === '1');
  const pm: string | number | null = extensions.find(extension => extension.key === 'pm')?.value || null;
  const rec = extensions.find(extension => extension.key === 'rec')?.value || null;
  const created = makeDateProperty(dayjs(JsTodoTxtObject.created()));
  const completed = makeDateProperty(dayjs(JsTodoTxtObject.completed()));
  const projects = JsTodoTxtObject.projects().length > 0 ? JsTodoTxtObject.projects() : null;
  const contexts = JsTodoTxtObject.contexts().length > 0 ? JsTodoTxtObject.contexts() : null;

  return {
    lineNumber,
    body,
    created,
    complete: JsTodoTxtObject.complete(),
    completed: completed,
    priority: JsTodoTxtObject.priority(),
    contexts: contexts,
    projects: projects,
    due,
    dueString,
    notify,
    t,
    tString,
    rec,
    hidden,
    pm,
    string: content,
  };
}

function createTodoObjects(fileContent: string | null): TodoObject[] | [] {
  if (!fileContent) {
    linesInFile = [];
    return [];
  }
  badge.count = 0;
  linesInFile = fileContent.split(/[\r\n]+/).filter(line => line.trim() !== '');

  // todo: might causes problems due to index offset created by it
  const excludeLinesWithPrefix: string[] = config.get('excludeLinesWithPrefix') || [];

  const todoObjects: TodoObject[] = linesInFile.map((line, index) => {
    if (excludeLinesWithPrefix.some(prefix => line.startsWith(prefix))) {
      return null;
    }

    const todoObject: TodoObject = createTodoObject(index, line);

    if (todoObject.body && !todoObject.complete) {
      handleNotification(todoObject.due?.isoString ?? null, todoObject.body, badge);
    }

    return todoObject;

  }).filter(Boolean) as TodoObject[];

  app.setBadgeCount(badge.count);

  return todoObjects;
}

function makeDateProperty(date: Dayjs): TodoObjectDateProperty | null {
  if(date.isValid()) {
    return {
      isoString: date.format('YYYY-MM-DD'),
      friendlyDateGroup: getFriendlyDateGroup(date),
    };
  }
  return null;
}

export { createTodoObjects, createTodoObject, linesInFile };
