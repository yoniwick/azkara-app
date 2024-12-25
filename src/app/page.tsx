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
  deathDateFocused: boolean;
  setDeathDateFocused: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ dates, setDates, times, setTimes, events, setEvents, language, showEvents, setShowEvents, deathDateFocused, setDeathDateFocused }) => {
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
        ['Erev Pesach', 'Erev Shavuot', 'Erev Sukkot', 'Erev Yom Kippur', 'Yom Kippur','Pesach I', 'Pesach II', 'Pesach VII', 'Pesach VIII', 'Sukkot I', 'Sukkot II', 'Sukkot VII', 'Sukkot VIII'].includes(holiday.desc) ||
        holiday.desc.includes("Rosh Hashana") || holiday.desc.includes("Pesach") || holiday.desc.includes("Shavuot") || holiday.desc.includes("Sukkot") || holiday.desc.includes("Yom Kippur") // Include any holiday with Pesach, Shavuot, Sukkot, Yom Kippur
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

    const dayBeforeShloshimEnd = new Date(shloshimEnd);
    dayBeforeShloshimEnd.setDate(dayBeforeShloshimEnd.getDate() - 1); // Set to the day before shloshimEnd

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

    const yahrzeitWesternDate = new Date(hebrewyahrzeitDate.greg().getTime() - 24 * 60 * 60 * 1000); // Subtract 1 day

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
    const hakamatMatzevahDate = new Date(hebrewHakamatMatzevahDate.greg().getTime() - 24 * 60 * 60 * 1000); // Subtract 1 day

    // Function to check if a date is Chol Hamoed
    const isCholHamoed = (date: Date): boolean => {
        const hebrewDate = new HDate(date);
        const holidays = HebrewCalendar.getHolidaysOnDate(hebrewDate) || []; // Provide empty array fallback
        
        // Log the Chol Hamoed holidays found
        const cholHamoedHolidays = holidays.filter(holiday => 
            holiday.desc.includes("(CH''M)")
        );

        if (cholHamoedHolidays.length > 0) {
            console.log("Chol Hamoed holidays found on", date.toDateString() + ":", cholHamoedHolidays.map(holiday => holiday.desc).join(", "));
        }

        // Check if the holiday is Chol Hamoed
        return cholHamoedHolidays.length > 0;
    };

    const isHebrewShloshimEndYomTov = isYomTov(shloshimEnd);
    const isHebrewShloshimEndCholHamoed = isCholHamoed(shloshimEnd);

    setEvents([
      { name: "Death Date", hebrewDate: nexthebrewDeathDate.toString(), date: times.deathTime === "after" ? death.toDateString() : new Date(death.setDate(death.getDate() + 1)).toDateString() },
      { name: "Burial Date", hebrewDate: hebrewBurialDate.toString(), date: times.burialTime === "after" ? burial.toDateString() : new Date(burial.setDate(burial.getDate() + 1)).toDateString() },
      { name: "End of Shiva", hebrewDate: hebrewShivaEnd.toString(), date: `${shivaEnd.toDateString()} (${translateInputLabels("after Shacharit", language)})` },
      { name: "Beginning of Shloshim", hebrewDate: (isHebrewShloshimEndYomTov || isHebrewShloshimEndCholHamoed) ? "Interrupted by Yom Tov" : hebrewShloshimEnd.toString(), date: (isHebrewShloshimEndYomTov || isHebrewShloshimEndCholHamoed) ? "Interrupted by Yom Tov" : `${dayBeforeShloshimEnd.toDateString()} (${translateInputLabels("after sundown", language)})` },
      { name: "End of Shloshim", hebrewDate: (isHebrewShloshimEndYomTov || isHebrewShloshimEndCholHamoed) ? "Interrupted by Yom Tov" : hebrewShloshimEnd.toString(), date: (isHebrewShloshimEndYomTov || isHebrewShloshimEndCholHamoed) ? "Interrupted by Yom Tov" : `${shloshimEnd.toDateString()} (${translateInputLabels("after Shacharit", language)})` },
      { name: "Hakamat Matzevah", hebrewDate: hebrewHakamatMatzevahDate.toString(), date: `${hakamatMatzevahDate.toDateString()} (${translateInputLabels("after sundown", language)})` },
      { name: "Upcoming Yahrzeit", hebrewDate: hebrewyahrzeitDate.toString(), date: `${yahrzeitWesternDate.toDateString()} (${translateInputLabels("after sundown", language)})` },
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
              onFocus={() => {
                if (!dates.burialDate) {
                  alert("Please enter the Burial Date first."); // Alert if Burial Date is not set
                } else {
                  setDeathDateFocused(true); // Set focus state if Burial Date is set
                }
              }}
              onChange={(e) => setDates({ ...dates, deathDate: e.target.value })}
              className="border p-2 rounded mr-2 date-input"
              disabled={!dates.burialDate}
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
          { !dates.burialDate && deathDateFocused && (
            <p className="text-red-500 text-sm">Please enter the Burial Date first.</p> // Message in red
          )}
        </div>
        <div className="date-input-section flex flex-col items-left mb-4 date-input-section">
          <label className="mb-1 text-sm">{translateInputLabels("Enter Burial Date", language)}</label>
          <div className="flex items-center justify-center mb-1">
            <input
              type="date"
              value={dates.burialDate}
              onChange={(e) => {
                const selectedBurialDate = e.target.value;
                if (selectedBurialDate && selectedBurialDate !== "" && new Date(selectedBurialDate) < new Date(dates.deathDate)) {
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
                <th className="border border-gray-300 p-2">{translateInputLabels("Hebrew Date", language)}</th>
                <th className="border border-gray-300 p-2">{translateInputLabels("Date", language)}</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 p-2">
                    {translateInputLabels(event.name, language)}
                  </td>
                  <td className="border border-gray-300 p-2">{event.hebrewDate}</td>
                  <td className="border border-gray-300 p-2">{event.date}</td>
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
  const [deathDateFocused, setDeathDateFocused] = useState(false); // New state to track focus

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
        deathDateFocused={deathDateFocused} 
        setDeathDateFocused={setDeathDateFocused} 
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
      "Hebrew Date": "Hebrew Date",
      "after sundown": "after sundown",
      "Burial Date": "Burial Date",
      "Beginning of Shloshim": "Beginning of Shloshim",
      "Hakamat Matzevah": "Hakamat Matzevah",
      "Interrupted by Yom Tov": "Interrupted by Yom Tov",
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
      "Calculate Events": "חשב אירועי",
      "after Shacharit": "אחרי שחרית",
      "at sundown": "בערב",
      "Hebrew Date": "תאריך עברי",
      "after sundown": "אחרי שקיעה",
      "Burial Date": "תאריך קבורה",
      "Beginning of Shloshim": "תחילת שלושים",
      "Hakamat Matzevah": "הקמת מצבה",
      "Interrupted by Yom Tov": "מופרע על ידי יום טוב",
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
      "Hebrew Date": "Еврейская дата",
      "after sundown": "После заката",
      "Burial Date": "Дата похорон",
      "Beginning of Shloshim": "Начало Шлошима",
      "Hakamat Matzevah": "Установка надгробия",
      "Interrupted by Yom Tov": "Прервано праздником",
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
      "Hebrew Date": "Fecha hebrea",
      "after sundown": "Después del atardecer",
      "Burial Date": "Fecha de entierro",
      "Beginning of Shloshim": "Inicio de Shloshim",
      "Hakamat Matzevah": "Instalación de la lápida",
      "Interrupted by Yom Tov": "Interrumpido por Yom Tov",
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
      "Hebrew Date": "Date hébraïque",
      "after sundown": "Après le coucher du soleil",
      "Burial Date": "Date d'enterrement",
      "Beginning of Shloshim": "Début de Shloshim",
      "Hakamat Matzevah": "Installation de la pierre tombale",
      "Interrupted by Yom Tov": "Interrompu par Yom Tov",
    },
  };
  return translations[language][label] || label;
};