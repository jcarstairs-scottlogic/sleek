window.electron = {
  ipcRenderer: {
    once: jest.fn(),
    send: jest.fn(),
  },
};

jest.useFakeTimers('modern');
jest.setSystemTime(new Date('2024-01-01T12:00:00.000'));
