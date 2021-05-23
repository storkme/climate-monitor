export interface Atc1441SensorData {
  mac: string;
  temp: number; // temperature in degrees
  battery: number; // battery level in percent (0-1)
  humidity: number; // humidity level in percent (0-1)
  battery_mV: number; // battery voltage in mV (why)
}

// https://github.com/pvvx/ATC_MiThermometer#custom-format-all-data-little-endian
export interface SensorData {
  mac: string;
  temp: number;
  humidity: number;
  battery_mV: number;
  battery_level: number;
  counter: number;
  flags: {
    tempTrigger: boolean;
    humidityTrigger: boolean;
  }
}
