import {Injectable, OnInit} from '@angular/core';
import {config} from '../../shared/config';
import {HubConnection, HubConnectionBuilder, LogLevel} from '@aspnet/signalr';

@Injectable({
  providedIn: 'root'
})
export class PositionService {

  private connection: HubConnection;
  private readonly hubEndpoint: string;
  private readonly hubChannel: string;

  constructor() {
    this.hubEndpoint = 'hubs/position';
    this.hubChannel = 'Position';
  }

  subscribe() {
    // zasubskrybuj się na kanal Position
  }

  invoke() {
    // pobierz pozycje
  }
}
