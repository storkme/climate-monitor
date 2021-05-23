import { decode_atc1441, decode_custom } from "./message-decoder";

describe("message-decoder", () => {
  describe("decode_atc1441", () => {
    it("should decode some stuff", () => {
      expect(
        decode_atc1441(Buffer.from("a4c138d9f4db00d432640c1e9c", "hex"))
      ).toEqual({
        mac: "A4:C1:38:D9:F4:DB",
        temp: 21.2,
        battery: 1.0,
        humidity: 0.5,
        battery_mV: 3102,
      });
    });
  });

  describe('decode_custom', () => {
    it('should decode stuff', () => {
      expect(
        decode_custom(Buffer.from("dbf4d938c1a45208b6121f0c642104", "hex"))
      ).toEqual({
        mac: "A4:C1:38:D9:F4:DB",
        temp: 21.3,
        humidity: 0.479,
        battery_level: 1.0,
        battery_mV: 3103,
        counter: 33,
        flags: {
          humidityTrigger: false,
          tempTrigger: true,
        }
      });
    });
  });
});
