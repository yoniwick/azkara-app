declare module 'hebrew-date' {
    export default function hebrewDate(year: number, month: number, day: number): {
      year: number;
      month: number;
      date: number;
      month_name: string;
    };
  }