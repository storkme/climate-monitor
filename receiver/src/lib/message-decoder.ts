import { Atc1441SensorData, SensorData } from "./types";

/**
 * old decoder for the atc1441 format
 * @param buf
 */
export function decode_atc1441(buf: Buffer): Atc1441SensorData {
  const mac = buf
    .slice(0, 6)
    .toString("hex")
    .match(/../g)!!
    .join(":")
    .toUpperCase();
  const temp = buf.readUInt16BE(6) / 10;
  const humidity = buf.readInt8(8) / 100;
  const battery = buf.readInt8(9) / 100;
  const battery_mV = buf.readUInt16BE(10);
  if (buf.length != 13) {
    console.log("wtf, weird buffer", buf.toString("hex"));
  }
  return { mac, temp, humidity, battery, battery_mV };
}

/**
 * Decode messages as described here:
 * https://github.com/pvvx/ATC_MiThermometer#custom-format-all-data-little-endian
 * @param buf
 */
export function decode_custom(buf: Buffer): SensorData {
  const f = buf.readUInt8(14);

  return {
    mac: buf
      .slice(0, 6)
      .reverse()
      .toString("hex")
      .match(/../g)!!
      .join(":")
      .toUpperCase(),
    temp: buf.readUInt16LE(6) / 100,
    humidity: buf.readUInt16LE(8) / 10000,
    battery_mV: buf.readUInt16LE(10),
    battery_level: buf.readUInt8(12) / 100,
    counter: buf.readUInt8(13),
    flags: {
      humidityTrigger: (f & 3) === 3,
      tempTrigger: (f & 4) === 4,
    },
  };
}
// dbf4d938c1a453081a121c0c648e04
