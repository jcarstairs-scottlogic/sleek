import React, { memo } from 'react';
import ListItem from '@mui/material/ListItem';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import dayjs from 'dayjs';
import updateLocale from 'dayjs/plugin/updateLocale';
import { friendlyDate } from 'renderer/Shared';
import type { i18n } from 'renderer/Settings/LanguageSelector';
import { type WithTranslation, withTranslation } from 'react-i18next';
dayjs.extend(updateLocale);

interface FormatGroupElementProps {
  groupElement: string | TodoObjectDateProperty;
  settings: Settings;
  t: typeof i18n.t;
  todotxtAttribute: string;
}

function formatGroupElement({ groupElement, settings, t, todotxtAttribute }: FormatGroupElementProps): string {
  // If group element is a date property, then format according to user preferences
  if (typeof groupElement === 'object') {
    if (settings.useHumanFriendlyDates) {
      const humanFriendlyDate = friendlyDate(
        groupElement.friendlyDateGroup,
        todotxtAttribute,
        settings,
        t
      ).pop();
      return humanFriendlyDate || groupElement.isoString;
    }
    return groupElement.isoString;
  }

  // No transformation required: display as-is
  return groupElement;
}

interface GroupProps extends WithTranslation {
  settings: Settings;
  title: string | string[] | TodoObjectDateProperty | TodoObjectDateProperty[];
  todotxtAttribute: string;
  filters: Filters | null;
  onClick: Function;
  t: typeof i18n.t;
}

const Group: React.FC<GroupProps> = memo(({ settings, t, title, todotxtAttribute, filters, onClick }) => {
  if (!title || (Array.isArray(title) && title.length === 0)) {
    return <ListItem className="row group"><Divider /></ListItem>;
  }
  
  const groupElements = Array.isArray(title)
    ? title
    : ([title] as string[] | TodoObjectDateProperty[]);
  const formattedGroupElements = groupElements.map(
    (groupElement) => formatGroupElement({ groupElement, settings, t, todotxtAttribute })
  );

  return (
    <ListItem className="row group">
      {formattedGroupElements.map((groupElement, index) => {
        const selected: boolean = filters && (filters[todotxtAttribute as keyof Filters] || []).some(
          (filter: Filter) => filter && filter.name === groupElement.trim()
        );
        return (
          <div
            key={index}
            className={selected ? 'selected filter' : 'filter'}
            data-todotxt-attribute={todotxtAttribute}
            data-todotxt-value={groupElement}
          >
            <Button className='attribute' onClick={() => onClick(todotxtAttribute, groupElement, groupElement.trim())} data-testid={`datagrid-button-${todotxtAttribute}`}>
              {groupElement.trim()}
            </Button>
          </div>
        );
      })}
    </ListItem>
  );
});

export default withTranslation()(Group);
