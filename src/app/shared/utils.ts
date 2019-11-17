import * as moment from "moment";
import { throwError, of } from "rxjs";

export class Utils {
  private readonly dateTimeFormat: string;

  constructor() {
    this.dateTimeFormat = "YYYY-MM-DD HH:mm:ss";
  }

  dateToUtc(date) {
    if (!date) {
      return;
    }
    const utcDate = moment.utc(date);
    return utcDate.format(this.dateTimeFormat);
  }

  dateToLocal(date) {
    if (!date) {
      return;
    }
    const localDate = moment(moment.utc(date)).local();
    return localDate.format(this.dateTimeFormat);
  }

  debounce(func, wait, immediate?) {
    let timeout;
    return function() {
      const context = this,
        args = arguments;
      const callNow = immediate && !timeout;
      const later = function() {
        timeout = null;
        if (!immediate) {
          func.apply(context, args);
        }
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) {
        func.apply(context, args);
      }
    };
  }

  convertToObjectOfUnits<T extends { unitId: number }>(
    units: T[]
  ): { [key: number]: T } {
    return units.reduce((obj, unit) => {
      obj[unit.unitId] = unit;
      return obj;
    }, {});
  }

  checkForHubConnectionError<T>(unitPositions: T[]) {
    return !unitPositions
      ? throwError("SignalR connection error")
      : of(unitPositions);
  }
}
