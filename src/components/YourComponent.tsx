import { TextArea } from './TextArea';

export const YourComponent = () => {
  return (
    <TextArea
      placeholder="Tell me the topic you want me to write about"
      className="jvp-writeabout-textarea"
      rows={4}
      aria-label="Topic input"
    />
  );
}; 