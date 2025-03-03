type ReportHandler = (metric: any) => void;

const reportWebVitals = (onPerfEntry?: ReportHandler): void => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    console.log('Performance metrics disabled');
  }
};

export default reportWebVitals;
