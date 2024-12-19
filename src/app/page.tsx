"use client";
import { useState, useEffect } from "react";
import { HDate, HebrewCalendar } from '@hebcal/core';

type Event = {
  name: string;
  date: string;
  hebrewDate: string;
};

// Define props type for Header component
type HeaderProps = {
  language: string;
  setLanguage: (language: string) => void;
};

// Header component
const Header: React.FC<HeaderProps> = ({ language, setLanguage }) => (
  <header className="flex flex-col items-center mb-4">
    <h1 className="text-l font-bold text-center mobile-title mt-2">
      {translateInputLabels("Mourning Halachot", language)}
    </h1>
    <select
      onChange={(e) => setLanguage(e.target.value)}
      value={language}
      className="language-select mt-2"
    >
      <option value="en">English</option>
      <option value="he">עברית</option>
      <option value="ru">Русский</option>
      <option value="es">Español</option>
      <option value="fr">Français</option>
    </select>
  </header>
);

// Main component
const Main: React.FC<{
  dates: { deathDate: string; burialDate: string };
  setDates: React.Dispatch<React.SetStateAction<{ deathDate: string; burialDate: string }>>;
  times: { deathTime: string; burialTime: string };
  setTimes: React.Dispatch<React.SetStateAction<{ deathTime: string; burialTime: string }>>;
  events: Event[];
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
  language: string;
  showEvents: boolean;
  setShowEvents: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ dates, setDates, times, setTimes, events, setEvents, language, showEvents, setShowEvents }) => {
  useEffect(() => {
    calculateEvents(); // Trigger calculation when language changes
  }, [language]); // Dependency array includes language

  // Trigger calculation when dates or times change
  useEffect(() => {
    calculateEvents();
  }, [dates, times]); // Dependency array includes dates and times

  const calculateEvents = () => {
    // Check if burial date is selected
    if (!dates.burialDate) {
      return; // Prevent further calculations if burial date is not set
    }

    // Check if death date is selected
    if (!dates.deathDate) return;

    const death = new Date(dates.deathDate);
    const burial = new Date(dates.burialDate);

    // Increment burial date if burialTime is "after"
    if (times.burialTime === "after") {
      burial.setDate(burial.getDate() + 1);
    }

    // Increment death date if deathTime is "after"
    if (times.deathTime === "after") {
      death.setDate(death.getDate() + 1);
    }

    // Check if the date is a Yom Tov
    const isYomTov = (date: Date): boolean => {
      const hebrewDate = new HDate(date);
      const holidays = HebrewCalendar.getHolidaysOnDate(hebrewDate) || []; // Provide empty array fallback
      
      console.log("Checking Yom Tov for date:", date); // Log the date being checked
      console.log("Holidays found:", holidays.map(holiday => holiday.desc)); // Log the holiday names

      // Check if the holiday is one of the specified Yom Tov
      return holidays.some(holiday => 
        ['Erev Pesach', 'Erev Shavuot', 'Erev Sukkot', 'Erev Rosh Hashana', 'Erev Yom Kippur'].includes(holiday.desc)
      );
    };

    let shivaEnd = new Date(burial);
    shivaEnd.setDate(shivaEnd.getDate() + 8); // 7 days + 1 day since the day of burial is included
    const hebrewShivaEnd = new HDate(shivaEnd); // Convert to Hebrew date

    // Check for holidays from burial date to shivaEnd
    let a = new Date(burial);
    a.setDate(a.getDate() + 1); // Start with burial date + 1

    console.log("Burial Date:", burial);
    console.log("Initial Shiva End Date:", shivaEnd);

    // Use a more functional approach to find the first Yom Tov date
    const holidayDates = [];
    while (a <= shivaEnd) {
      if (isYomTov(a)) {
        holidayDates.push(new Date(a)); // Collect Yom Tov dates
      }
      a.setDate(a.getDate() + 1); // Increment a by 1 day
    }

    // If any Yom Tov dates were found, update shivaEnd
    if (holidayDates.length > 0) {
      const firstHoliday = holidayDates[0];
      shivaEnd.setDate(firstHoliday.getDate() - 1); // Set shivaEnd to the day before the first Yom Tov
      console.log("Holiday found, updating Shiva End to:", shivaEnd);
    }

    const shloshimEnd = new Date(burial);
    shloshimEnd.setDate(shloshimEnd.getDate() + 31); // 30 days + 1 day since the day of burial is included
    const hebrewShloshimEnd = new HDate(shloshimEnd); // Convert to Hebrew date

    // Check for holidays from burial date to shloshimEnd
    let b = new Date(burial);
    b.setDate(b.getDate() + 1); // Start with burial date + 1

    console.log("Initial Shloshim End Date:", shloshimEnd);

    // Use a more functional approach to find the first Yom Tov date for shloshimEnd
    const shloshimHolidayDates = [];
    while (b <= shloshimEnd) {
      if (isYomTov(b)) {
        shloshimHolidayDates.push(new Date(b)); // Collect Yom Tov dates for shloshim
      }
      b.setDate(b.getDate() + 1); // Increment b by 1 day
    }

    // If any Yom Tov dates were found, update shloshimEnd
    if (shloshimHolidayDates.length > 0) {
      const firstHoliday = shloshimHolidayDates[0];
      shloshimEnd.setDate(firstHoliday.getDate()); // Set shloshimEnd by the onset of the first Yom Tov
      console.log("Holiday found, updating Shloshim End to:", shloshimEnd);
    }

    const hebrewDeathDate = new HDate(death);
    const nexthebrewDeathDate = new HDate(hebrewDeathDate.abs() + 1); 
    const currentHebrewYear = new HDate().getFullYear(); // Get current Hebrew year
    
    const hebrewyahrzeitDate = new HDate(
      nexthebrewDeathDate.getDate(),
      nexthebrewDeathDate.getMonth(),
      nexthebrewDeathDate.getFullYear() === currentHebrewYear ? currentHebrewYear + 1 : currentHebrewYear // Conditional year assignment
    );
    
    const hebrewBurialDate = new HDate(burial);
    // Check if the burial date is in a leap year
    const isLeapYear = new HDate(hebrewBurialDate).isLeapYear();
    console.log("Is the year", hebrewBurialDate.getFullYear(), "a leap year?", isLeapYear); // Log the leap year status

    const yahrzeitWesternDate = hebrewyahrzeitDate.greg();

    // Hakamat Matzevah calculation
    let newMonth = hebrewBurialDate.getMonth() + 11; // Add 11 months
    let newYear = hebrewBurialDate.getFullYear() + 1;

    // Handle month rollover properly
    if (isLeapYear && newMonth > 13) {
      newMonth -= 13; // Adjust month if it exceeds 13 in a leap year
    } else if (!isLeapYear && newMonth > 12) {
      newMonth -= 12; // Adjust month if it exceeds 12 in a non-leap year
    }

    const hebrewHakamatMatzevahDate = new HDate(
      hebrewBurialDate.getDate() + 1,
      newMonth,
      newYear
    );
    const hakamatMatzevahDate = hebrewHakamatMatzevahDate.greg();

    setEvents([
      { name: "Death Date", date: times.deathTime === "after" ? death.toDateString() : new Date(death.setDate(death.getDate() + 1)).toDateString(), hebrewDate: nexthebrewDeathDate.toString() },
      { name: "End of Shiva", date: `${shivaEnd.toDateString()} (${translateInputLabels("after Shacharit", language)})`, hebrewDate: hebrewShivaEnd.toString() },
      { name: "End of Shloshim", date: `${shloshimEnd.toDateString()} (${translateInputLabels("at sundown", language)})`, hebrewDate: hebrewShloshimEnd.toString() },
      { name: "Hakamat Matzevah", date: `${hakamatMatzevahDate.toDateString()}`, hebrewDate: hebrewHakamatMatzevahDate.toString() },
      { name: "Upcoming Yahrzeit", date: `${yahrzeitWesternDate.toDateString()}`, hebrewDate: hebrewyahrzeitDate.toString() },
    ]);
    setShowEvents(true);
  };


  return (
    <main className="min-h-[80vh] bg-gray-100 flex flex-col items-center p-4 mt-4">
      <div className="date-input-container">
        <div className="date-input-section flex flex-col items-left mb-4 date-input-section">
          <label className="mb-1 text-sm">{translateInputLabels("Enter Death Date", language)}</label>
          <div className="flex items-center justify-center mb-1">
            <input
              type="date"
              value={dates.deathDate}
              onChange={(e) => setDates({ ...dates, deathDate: e.target.value })}
              className="border p-2 rounded mr-2 date-input"
            />
            <div className="flex items-center">
              <label className="mr-2">
                <input
                  type="checkbox"
                  checked={times.deathTime === "after"}
                  onChange={(e) => setTimes({ ...times, deathTime: e.target.checked ? "after" : "before" })}
                />
                <span className="ml-1 text-sm">{translateInputLabels("After Sundown", language)}</span>
              </label>
            </div>
          </div>
        </div>
        <div className="date-input-section flex flex-col items-left mb-4 date-input-section">
          <label className="mb-1 text-sm">{translateInputLabels("Enter Burial Date", language)}</label>
          <div className="flex items-center justify-center mb-1">
            <input
              type="date"
              value={dates.burialDate}
              onChange={(e) => {
                const selectedBurialDate = e.target.value;
                if (new Date(selectedBurialDate) < new Date(dates.deathDate)) {
                  alert("Burial date must be the same or after the death date.");
                  return;
                }
                setDates({ ...dates, burialDate: selectedBurialDate });
              }}
              className="border p-2 rounded mr-2 date-input"
            />
            <div className="flex items-center">
              <label className="mr-2">
                <input
                  type="checkbox"
                  checked={times.burialTime === "after"}
                  onChange={(e) => setTimes({ ...times, burialTime: e.target.checked ? "after" : "before" })}
                />
                <span className="ml-1 text-sm">{translateInputLabels("After Sundown", language)}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {showEvents && events.length > 0 && (
        <div>
          <table className="min-w-full border-collapse border border-gray-300 mt-2">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2">{translateInputLabels("Event", language)}</th>
                <th className="border border-gray-300 p-2">{translateInputLabels("Date", language)}</th>
                <th className="border border-gray-300 p-2">{translateInputLabels("Hebrew Date", language)}</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 p-2">
                    {translateInputLabels(event.name, language)}
                  </td>
                  <td className="border border-gray-300 p-2">{event.date}</td>
                  <td className="border border-gray-300 p-2">{event.hebrewDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
};

// Footer component
const Footer = () => (
  <footer className="mt-3 text-center h-4 flex items-center justify-center">
    <p className="text-xs leading-tight p-1 md:text-sm">
      © {new Date().getFullYear()} Azkara App by International Halacha Institute
    </p>
  </footer>
);

export default function Home() {
  const [dates, setDates] = useState({
    deathDate: "",
    burialDate: "",
  });
  const [times, setTimes] = useState({
    deathTime: "before",
    burialTime: "before",
  });
  const [events, setEvents] = useState<Event[]>([]);
  const [language, setLanguage] = useState<string>("en");
  const [showEvents, setShowEvents] = useState(false);

  return (
    <div>
      <Header language={language} setLanguage={setLanguage} />
      <Main 
        dates={dates} 
        setDates={setDates} 
        times={times} 
        setTimes={setTimes} 
        events={events} 
        setEvents={setEvents} 
        language={language} 
        showEvents={showEvents} 
        setShowEvents={setShowEvents} 
      />
      <Footer />
    </div>
  );
}

// Combined translation function
const translateInputLabels = (label: string, language: string) => {
  const translations: { [key: string]: { [key: string]: string } } = {
    en: {
      "Enter Death Date": "Enter Death Date:",
      "Enter Burial Date": "Enter Burial Date:",
      "After Sundown": "After Sundown",
      "Event": "Event",
      "Date": "Date",
      "Death Date": "Death Date",
      "End of Shiva": "End of Shiva",
      "End of Shloshim": "End of Shloshim",
      "Upcoming Yahrzeit": "Upcoming Yahrzeit",
      "Mourning Halachot": "Mourning Halachot according to Harav David Shalom Naki for Sephardim",
      "Calculate Events": "Calculate Events",
      "after Shacharit": "after Shacharit",
      "at sundown": "at sundown",
    },
    he: {
      "Enter Death Date": "הכנס תאריך פטירה:",
      "Enter Burial Date": "הכנס תאריך קבורה:",
      "After Sundown": "אחרי שקיעה",
      "Event": "אירוע",
      "Date": "תאריך",
      "Death Date": "תאריך פטירה",
      "End of Shiva": "סוף שיבעה",
      "End of Shloshim": "סוף שלושים",
      "Upcoming Yahrzeit": "יארצייט הקרוב",
      "Mourning Halachot": "הלכות אבלות לפי הרב דוד שלום נקי לספרדים",
      "Calculate Events": "חשב אירועים",
      "after Shacharit": "אחרי שחרית",
      "at sundown": "בערב",
    },
    ru: {
      "Enter Death Date": "Введите дату смерти:",
      "Enter Burial Date": "Введите дату похорон:",
      "Before Sundown": "Перед закатом",
      "After Sundown": "После заката",
      "Event": "Событие",
      "Date": "Дата",
      "Death Date": "Дата смерти",
      "End of Shiva": "Конец Шивы",
      "End of Shloshim": "Конец Шлошима",
      "Upcoming Yahrzeit": "Предстоящий ярцайт",
      "Mourning Halachot": "Законы траура согласно раввину Давиду Шалом Наке для сефардов",
      "Calculate Events": "Рассчитать события",
      "after Shacharit": "после Шахарита",
      "at sundown": "на закате",
    },
    es: {
      "Enter Death Date": "Ingrese la fecha de fallecimiento:",
      "Enter Burial Date": "Ingrese la fecha de entierro:",
      "Before Sundown": "Antes del atardecer",
      "After Sundown": "Después del atardecer",
      "Event": "Evento",
      "Date": "Fecha",
      "Death Date": "Fecha de fallecimiento",
      "End of Shiva": "Fin de Shiva",
      "End of Shloshim": "Fin de Shloshim",
      "Upcoming Yahrzeit": "Yahrzeit próximo",
      "Mourning Halachot": "Halajot de duelo según el rabino David Shalom Naki para sefardíes",
      "Calculate Events": "Calcular eventos",
      "after Shacharit": "después de Shajarit",
      "at sundown": "al atardecer",
    },
    fr: {
      "Enter Death Date": "Entrez la date de décès :",
      "Enter Burial Date": "Entrez la date d'enterrement :",
      "Before Sundown": "Avant le coucher du soleil",
      "After Sundown": "Après le coucher du soleil",
      "Event": "Événement",
      "Date": "Date",
      "Death Date": "Date de décès",
      "End of Shiva": "Fin de Shiva",
      "End of Shloshim": "Fin de Shloshim",
      "Upcoming Yahrzeit": "Yahrzeit à venir",
      "Mourning Halachot": "Halakhot de deuil selon le rabbin David Shalom Naki pour les séfarades",
      "Calculate Events": "Calculer les événements",
      "after Shacharit": "après Shaharit",
      "at sundown": "au coucher du soleil",
    },
  };
  return translations[language][label] || label;
};