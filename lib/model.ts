class SimpleDate {
  year: number;
  month: number;
  day: number;

  constructor(date: Date | SimpleDate | string = new Date()) {
    if (date instanceof Date) {
      this.year = date.getFullYear();
      this.month = date.getMonth();
      this.day = date.getDate();
    } else if (date instanceof SimpleDate) {
      this.year = date.year;
      this.month = date.month;
      this.day = date.day;
    } else if (typeof date === "string") {
      const parsedDate = new Date(date);
      this.year = parsedDate.getFullYear();
      this.month = parsedDate.getMonth();
      this.day = parsedDate.getDate();
    } else {
      throw new Error(
        "Date must be either a Date, SimpleDate, or stringified date",
      );
    }
  }

  static get Today(): SimpleDate {
    return new SimpleDate();
  }

  static get Yesterday(): SimpleDate {
    const now = new Date();
    now.setDate(now.getDate() - 1);
    return new SimpleDate(now);
  }

  equals(other: SimpleDate): boolean {
    return this.toString() === other.toString();
  }

  static compare(a: SimpleDate, b: SimpleDate) {
    return a.getTime() - b.getTime();
  }

  get formatted() {
    return this.toString();
  }

  get jsDate(): Date {
    return new Date(Date.UTC(this.year, this.month, this.day));
  }

  formatDateDifference(other: SimpleDate): string {
    const baseDate = this.toUTCDatetime();
    const pastDate = other.toUTCDatetime();

    const diffMs = baseDate.getTime() - pastDate.getTime();
    const numDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (numDays === 0) {
      return "today";
    }
    if (numDays === 1) {
      return "yesterday";
    }
    if (numDays > 30) {
      const numMonths = Math.floor(numDays / 30.42); // Approximation for months
      return `${numMonths} month${numMonths > 1 ? "s" : ""} ago`;
    }

    return `${numDays} day${numDays > 1 ? "s" : ""} ago`;
  }

  toString(): string {
    return this.jsDate.toISOString().split("T")[0];
  }

  // This is important for Chrome DevTools -- doesn't seem to work
  [Symbol.for("nodejs.util.inspect.custom")](): string {
    return this.toString();
  }

  // For Firefox DevTools
  inspect(): string {
    return this.toString();
  }

  toJSON() {
    // serialize to JSON
    return this.toString();
  }

  toDate(): Date {
    return this.toUTCDatetime();
  }

  toUTCDatetime(): Date {
    return new Date(this.toString());
  }

  // TODO: This is used to sort SimpleDate objects.  Can we do something better?
  getTime(): number {
    return this.toUTCDatetime().getTime();
  }

  get priorYearEnd(): SimpleDate {
    return this.getEndOfNYearsAgo(1);
  }

  get priorMonthEnd(): SimpleDate {
    return this.getEndOfNMonthsAgo(1);
  }

  // TODO: Make this a generic 'add' function that also takes a 'unit' parameter
  addDays(n: number): SimpleDate {
    const baseDate = this.toUTCDatetime();
    const newDate = baseDate;
    newDate.setDate(baseDate.getDate() + n);
    return new SimpleDate(newDate);
  }

  // TODO: use a similar pattern as addDays
  getDateNDaysAgo(n: number): SimpleDate {
    const baseDate = this.toUTCDatetime();
    const newDate = baseDate;
    newDate.setDate(baseDate.getDate() - n);
    return new SimpleDate(newDate);
  }

  getDateNMonthsAgo(n: number): SimpleDate {
    const baseDate = this.toUTCDatetime();
    const targetDate = new Date(
      Date.UTC(
        baseDate.getFullYear(),
        baseDate.getMonth() - n,
        baseDate.getDate(),
      ),
    );

    // Handle cases where the target date overflows to the next month
    if (targetDate.getMonth() !== (baseDate.getMonth() - n + 12) % 12) {
      targetDate.setDate(0); // Set to the last day of the previous month
    }

    return new SimpleDate(targetDate);
  }

  getDateNYearsAgo(n: number): SimpleDate {
    const baseDate = this.toUTCDatetime();
    return new SimpleDate(
      new Date(
        Date.UTC(
          baseDate.getFullYear() - n,
          baseDate.getMonth(),
          baseDate.getDate(),
        ),
      ),
    );
  }

  getEndOfNYearsAgo(n: number): SimpleDate {
    const priorYear = this.toUTCDatetime().getFullYear() - n;
    const priorYearEndDate = new Date(Date.UTC(priorYear, 11, 31));
    return new SimpleDate(priorYearEndDate);
  }

  getEndOfNMonthsAgo(n: number): SimpleDate {
    return new SimpleDate(
      // `0` gives the last day of the previous month.
      new Date(Date.UTC(this.year, this.month - n + 1, 0)),
    );
  }
}

export { SimpleDate };
