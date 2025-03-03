/// <reference types="react-scripts" />

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

declare module '@supabase/supabase-js'; 