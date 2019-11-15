import { Injectable } from "@angular/core";
import { config } from "../../shared/config";
import { HubConnection, HubConnectionBuilder, LogLevel } from "@aspnet/signalr";
import { UnitPositionModel } from "../models/UnitPositionModels";
import { Subject } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class PositionService {
  private connection: HubConnection;
  private readonly hubEndpoint: string;
  private readonly hubChannel: string;
  private _signalRHubHubPositions: Subject<UnitPositionModel[]> = new Subject();

  public signalRHubHubPositions$ = this._signalRHubHubPositions.asObservable();

  constructor() {
    this.hubEndpoint = "hubs/position";
    this.hubChannel = "Position";
  }

  subscribe() {
    this.connection = new HubConnectionBuilder()
      .withUrl(config.apiUrl + this.hubEndpoint)
      .configureLogging(LogLevel.Information)
      .build();

    this.connection.start();
  }

  invoke() {
    this.connection.on(this.hubChannel, (data: UnitPositionModel[]) => {
      this._signalRHubHubPositions.next(data);
    });
  }

  close() {
    this.connection.stop();
  }
}
