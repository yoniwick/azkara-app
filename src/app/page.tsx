"use client";
import { useState, useEffect } from "react";
import { HDate } from '@hebcal/core';

type Event = {
  name: string;
  date: string;
};

// Define props type for Header component
type HeaderProps = {
  language: string;
  setLanguage: (language: string) => void;
};

// Header component
const Header: React.FC<HeaderProps> = ({ language, setLanguage }) => (
  <header className="flex flex-col items-center mb-4">
    <h1 className="text-2xl font-bold text-center mobile-title">
      {translateInputLabels("Mourning Halachot", language)}
    </h1>
    <select onChange={(e) => setLanguage(e.target.value)} value={language} className="mt-1">
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

    // Increment burial date if deathTime is "after"
    if (times.deathTime === "after") {
      death.setDate(death.getDate() + 1);
    }

    const shivaEnd = new Date(burial);
    shivaEnd.setDate(shivaEnd.getDate() + 7);

    const shloshimEnd = new Date(burial);
    shloshimEnd.setDate(shloshimEnd.getDate() + 30);

    const hebrewDeathDate = new HDate(death);
    const nexthebrewDeathDate = new HDate(hebrewDeathDate.abs() + 1); 
    const hebrewyahrzeitDate = new HDate(
      nexthebrewDeathDate.getDate(),
      nexthebrewDeathDate.getMonth(),
      nexthebrewDeathDate.getFullYear() + 1
    );

    const yahrzeitWesternDate = hebrewyahrzeitDate.greg();

    setEvents([
      { name: "Hebrew Death Date", date: nexthebrewDeathDate.toString() },
      { name: "End of Shiva", date: `${shivaEnd.toDateString()} (${translateInputLabels("after Shacharit", language)})` },
      { name: "End of Shloshim", date: `${shloshimEnd.toDateString()} (${translateInputLabels("at sundown", language)})` },
      { name: "Yahrzeit", date: `${hebrewyahrzeitDate.toString()} (${yahrzeitWesternDate.toDateString()})` },
    ]);
    setShowEvents(true);
  };

  return (
    <main className="min-h-[80vh] bg-gray-100 flex flex-col items-center p-4 mt-4">
      <div className="flex flex-col items-center mb-4 w-full max-w-md">
        <div className="flex flex-col mb-4 w-full">
          <label className="mb-1 text-center">{translateInputLabels("Enter Death Date", language)}</label>
          <div className="flex items-center justify-center">
            <input
              type="date"
              value={dates.deathDate}
              onChange={(e) => setDates({ ...dates, deathDate: e.target.value })}
              className="border p-2 rounded mr-2"
            />
            <select onChange={(e) => setTimes({ ...times, deathTime: e.target.value })} value={times.deathTime} className="border p-2 rounded hidden md:block">
              <option value="before">{translateInputLabels("Before Sundown", language)}</option>
              <option value="after">{translateInputLabels("After Sundown", language)}</option>
            </select>
          </div>
          <div className="flex items-center justify-center md:hidden">
            <select onChange={(e) => setTimes({ ...times, deathTime: e.target.value })} value={times.deathTime} className="border p-2 rounded">
              <option value="before">{translateInputLabels("Before Sundown", language)}</option>
              <option value="after">{translateInputLabels("After Sundown", language)}</option>
            </select>
          </div>
        </div>
        <div className="flex flex-col mb-4 w-full">
          <label className="mb-1 text-center">{translateInputLabels("Enter Burial Date", language)}</label>
          <div className="flex items-center justify-center">
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
              className="border p-2 rounded mr-2"
            />
            <select onChange={(e) => setTimes({ ...times, burialTime: e.target.value })} value={times.burialTime} className="border p-2 rounded hidden md:block">
              <option value="before">{translateInputLabels("Before Sundown", language)}</option>
              <option value="after">{translateInputLabels("After Sundown", language)}</option>
            </select>
          </div>
          <div className="flex items-center justify-center md:hidden">
            <select onChange={(e) => setTimes({ ...times, burialTime: e.target.value })} value={times.burialTime} className="border p-2 rounded">
              <option value="before">{translateInputLabels("Before Sundown", language)}</option>
              <option value="after">{translateInputLabels("After Sundown", language)}</option>
            </select>
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
              </tr>
            </thead>
            <tbody>
              {events.map((event, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 p-2">
                    {translateInputLabels(event.name, language)}
                  </td>
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
      © {new Date().getFullYear()} Azkara App by International Halacha Institute. All rights reserved.
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
      "Before Sundown": "Before Sundown",
      "After Sundown": "After Sundown",
      "Event": "Event",
      "Date": "Date",
      "Hebrew Death Date": "Hebrew Death Date",
      "End of Shiva": "End of Shiva",
      "End of Shloshim": "End of Shloshim",
      "Yahrzeit": "Yahrzeit",
      "Mourning Halachot": "Mourning Halachot according to Harav David Shalom Naki for Sephardim",
      "Calculate Events": "Calculate Events",
      "after Shacharit": "after Shacharit",
      "at sundown": "at sundown",
    },
    he: {
      "Enter Death Date": "הכנס תאריך פטירה:",
      "Enter Burial Date": "הכנס תאריך קבורה:",
      "Before Sundown": "לפני שקיעה",
      "After Sundown": "אחרי שקיעה",
      "Event": "אירוע",
      "Date": "תאריך",
      "Hebrew Death Date": "תאריך פטירה יהודית",
      "End of Shiva": "סוף שיבעה",
      "End of Shloshim": "סוף שלושים",
      "Yahrzeit": "יארצייט",
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
      "Hebrew Death Date": "Еврейская дата смерти",
      "End of Shiva": "Конец Шивы",
      "End of Shloshim": "Конец Шлошима",
      "Yahrzeit": "Ярцайт",
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
      "Hebrew Death Date": "Fecha de fallecimiento hebrea",
      "End of Shiva": "Fin de Shiva",
      "End of Shloshim": "Fin de Shloshim",
      "Yahrzeit": "Yahrzeit",
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
      "Hebrew Death Date": "Date de décès hébraïque",
      "End of Shiva": "Fin de Shiva",
      "End of Shloshim": "Fin de Shloshim",
      "Yahrzeit": "Yahrzeit",
      "Mourning Halachot": "Halakhot de deuil selon le rabbin David Shalom Naki pour les séfarades",
      "Calculate Events": "Calculer les événements",
      "after Shacharit": "après Shaharit",
      "at sundown": "au coucher du soleil",
    },
  };
  return translations[language][label] || label;
};