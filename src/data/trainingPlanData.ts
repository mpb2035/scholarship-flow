export interface TrainingDay {
  date: string;
  activity: string;
  details: string;
  type: 'rest' | 'race' | 'workout';
}

export const trainingPlan: TrainingDay[] = [
  { date: "2026-01-11", activity: "Easy Run", details: "5 km @ conversational pace", type: "workout" },
  { date: "2026-01-12", activity: "Rest", details: "Active recovery / stretching", type: "rest" },
  { date: "2026-01-13", activity: "Tempo Run", details: "4 km @ 5:30-5:40/km", type: "workout" },
  { date: "2026-01-14", activity: "Easy Run", details: "5 km easy", type: "workout" },
  { date: "2026-01-15", activity: "Rest", details: "Rest day", type: "rest" },
  { date: "2026-01-16", activity: "Interval Training", details: "6 x 400m @ 5:00/km pace", type: "workout" },
  { date: "2026-01-17", activity: "Long Run", details: "10 km @ easy pace", type: "workout" },
  { date: "2026-01-18", activity: "Rest", details: "Active recovery", type: "rest" },
  { date: "2026-01-19", activity: "Easy Run", details: "6 km @ conversational pace", type: "workout" },
  { date: "2026-01-20", activity: "Fartlek", details: "5 km with speed variations", type: "workout" },
  { date: "2026-01-21", activity: "Rest", details: "Rest day", type: "rest" },
  { date: "2026-01-22", activity: "Tempo Run", details: "5 km @ 5:30/km", type: "workout" },
  { date: "2026-01-23", activity: "Easy Run", details: "5 km easy", type: "workout" },
  { date: "2026-01-24", activity: "Long Run", details: "12 km @ easy pace", type: "workout" },
  { date: "2026-01-25", activity: "Rest", details: "Active recovery", type: "rest" },
  { date: "2026-01-26", activity: "Interval Training", details: "8 x 400m @ 4:50/km pace", type: "workout" },
  { date: "2026-01-27", activity: "Easy Run", details: "6 km easy", type: "workout" },
  { date: "2026-01-28", activity: "Rest", details: "Rest day", type: "rest" },
  { date: "2026-01-29", activity: "Tempo Run", details: "6 km @ 5:25/km", type: "workout" },
  { date: "2026-01-30", activity: "Easy Run", details: "5 km easy", type: "workout" },
  { date: "2026-01-31", activity: "Long Run", details: "14 km @ easy pace", type: "workout" },
  // February
  { date: "2026-02-07", activity: "Long Run", details: "15 km @ easy pace", type: "workout" },
  { date: "2026-02-14", activity: "Long Run", details: "16 km @ easy pace", type: "workout" },
  { date: "2026-02-21", activity: "Long Run", details: "12 km (Ramadan maintenance)", type: "workout" },
  // March - Ramadan (Feb 19 - Mar 19)
  { date: "2026-03-07", activity: "Night Run", details: "8 km easy (Ramadan)", type: "workout" },
  { date: "2026-03-14", activity: "Night Run", details: "10 km easy (Ramadan)", type: "workout" },
  // April - Build phase
  { date: "2026-04-04", activity: "Long Run", details: "16 km @ easy pace", type: "workout" },
  { date: "2026-04-11", activity: "Long Run", details: "17 km @ easy pace", type: "workout" },
  { date: "2026-04-18", activity: "Long Run", details: "18 km @ easy pace", type: "workout" },
  { date: "2026-04-25", activity: "Half Marathon Test", details: "21.1 km @ race simulation", type: "race" },
  // May - Peak training
  { date: "2026-05-02", activity: "Long Run", details: "18 km with tempo finish", type: "workout" },
  { date: "2026-05-09", activity: "Long Run", details: "19 km @ easy pace", type: "workout" },
  { date: "2026-05-16", activity: "Long Run", details: "20 km @ easy pace", type: "workout" },
  { date: "2026-05-23", activity: "Long Run", details: "18 km with race pace segments", type: "workout" },
  { date: "2026-05-30", activity: "Long Run", details: "16 km recovery", type: "workout" },
  // June
  { date: "2026-06-06", activity: "Long Run", details: "20 km @ easy pace", type: "workout" },
  { date: "2026-06-13", activity: "Long Run", details: "18 km tempo", type: "workout" },
  { date: "2026-06-20", activity: "Half Marathon Test", details: "21.1 km @ race pace", type: "race" },
  { date: "2026-06-27", activity: "Recovery Week", details: "15 km easy", type: "workout" },
  // July
  { date: "2026-07-04", activity: "Long Run", details: "18 km @ race pace", type: "workout" },
  { date: "2026-07-11", activity: "Long Run", details: "20 km with intervals", type: "workout" },
  { date: "2026-07-18", activity: "Long Run", details: "18 km tempo", type: "workout" },
  { date: "2026-07-25", activity: "Long Run", details: "16 km easy", type: "workout" },
  // August
  { date: "2026-08-01", activity: "Long Run", details: "20 km @ race pace", type: "workout" },
  { date: "2026-08-08", activity: "Long Run", details: "18 km with speed work", type: "workout" },
  { date: "2026-08-15", activity: "Half Marathon Test", details: "21.1 km @ target pace", type: "race" },
  { date: "2026-08-22", activity: "Recovery", details: "12 km easy", type: "workout" },
  { date: "2026-08-29", activity: "Long Run", details: "18 km @ race pace", type: "workout" },
  // September
  { date: "2026-09-05", activity: "Long Run", details: "20 km final long run", type: "workout" },
  { date: "2026-09-12", activity: "Long Run", details: "16 km @ race pace", type: "workout" },
  { date: "2026-09-19", activity: "Long Run", details: "14 km taper start", type: "workout" },
  { date: "2026-09-26", activity: "Long Run", details: "12 km easy taper", type: "workout" },
  // October - Taper
  { date: "2026-10-03", activity: "Taper Run", details: "10 km easy", type: "workout" },
  { date: "2026-10-10", activity: "Taper Run", details: "8 km with strides", type: "workout" },
  { date: "2026-10-17", activity: "Taper Run", details: "6 km easy", type: "workout" },
  { date: "2026-10-24", activity: "Shakeout", details: "5 km @ race pace feel", type: "workout" },
  { date: "2026-10-31", activity: "Rest", details: "Pre-race rest", type: "rest" },
  // Race Day
  { date: "2026-11-01", activity: "RACE DAY", details: "Half Marathon - Sub 2:00:00 Goal!", type: "race" },
];

export const goalInfo = {
  raceDate: "2026-11-01",
  targetTime: "1:59:59",
  targetPace: "5:41/km",
  distance: 21.1,
  ramadanStart: "2026-02-19",
  ramadanEnd: "2026-03-19",
};
