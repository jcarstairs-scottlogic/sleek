import React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { i18n } from '../Settings/LanguageSelector';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import updateLocale from 'dayjs/plugin/updateLocale';
import './DatePicker.scss';
dayjs.extend(updateLocale);

interface Props extends WithTranslation {
  date: string | null;
  type: string;
  settings: Settings;
  handleChange: Function;
  t: typeof i18n.t;
}

const DatePickerComponent: React.FC<Props> = ({
  date,
  type,
  settings,
  handleChange,
  t,
}) => {
  dayjs.updateLocale(settings.language, {
    weekStart: settings.weekStart,
  });
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={settings.language}>
      <DatePicker
        className="datePicker"
        format="YYYY-MM-DD"
        label={t(`todoDialog.datePicker.${type}`)}
        value={date ? dayjs(date) : null}
        onChange={(date) => handleChange(type, date)}
        // data-testid={`dialog-picker-date-${type}`}
        // InputProps={{ 'data-testid': `dialog-picker-date-${type}` }}
        slotProps={{
          field: { clearable: true, onClear: () => handleChange(null) },
        }}
      />
    </LocalizationProvider>
  );
};

export default withTranslation()(DatePickerComponent);
