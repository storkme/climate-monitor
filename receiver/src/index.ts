import { DeviceProps } from "bluez";
import { decode_custom } from "./lib/message-decoder";

const Bluez = require("bluez");
const bluetooth = new Bluez();

const sensorUuid = "0000181a-0000-1000-8000-00805f9b34fb";

const sensors = {
  "A4:C1:38:E0:35:3F": "archimedes",
  "A4:C1:38:55:17:CF": "boyle",
  "A4:C1:38:D9:F4:DB": "celcius",
} as any;

// Register callback for new devices
bluetooth.on("device", async (address: string, props: DeviceProps) => {
  const sensorName = sensors[address];
  if (sensorName) {
    console.log(
      `${sensorName.padEnd(12, " ")} [initial]`,
      decode_custom(Buffer.from(props.ServiceData[sensorUuid]))
    );
    const dev = await bluetooth.getDevice(address);
    dev.on("PropertiesChanged", (props: { [p: string]: any }) => {
      if (
        !props ||
        !props["ServiceData"] ||
        !props["ServiceData"][sensorUuid]
      ) {
        console.error("received invalid props", props);
        return;
      }
      const { temp, humidity } = decode_custom(
        Buffer.from(props["ServiceData"][sensorUuid])
      );
      console.log(
        `${sensorName.padEnd(12, " ")} → ${temp.toFixed(2)}C / ${(
          humidity * 100
        ).toFixed(0)}%`
      );
    });
  }
});

bluetooth
  .init()
  .then(async () => {
    // listen on first bluetooth adapter
    const adapter = await bluetooth.getAdapter();
    await adapter.StartDiscovery();
  })
  .catch(console.error);
