import {DeviceProps} from "bluez";
import {decode_custom} from "./lib/message-decoder";

import express from 'express';
import { collectDefaultMetrics, register, Gauge } from 'prom-client';

const Bluez = require("bluez");
const bluetooth = new Bluez();
collectDefaultMetrics({ prefix:'climon_' });

const gauges = {
    temp: new Gauge({name: 'temp',help:'temperature', labelNames: ['sensor']}),
    humidity: new Gauge({name: 'humidity', help:'humidity', labelNames: ['sensor']}),
    battery: new Gauge({name: 'battery', help:'battery level', labelNames: ['sensor']}),
};

const sensorUuid = "0000181a-0000-1000-8000-00805f9b34fb";

const sensors = {
    "A4:C1:38:E0:35:3F": "archimedes",
    "A4:C1:38:55:17:CF": "boyle",
    "A4:C1:38:D9:F4:DB": "celcius",
} as any;

const devices = new Set();
const unknownDevices = new Set();

// Register callback for new devices
bluetooth.on("device", async (address: string, props: DeviceProps) => {
    const sensorName = sensors[address];
    if (sensorName && !devices.has(sensorName)) {
        devices.add(sensorName);
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
            const {temp, humidity, battery_level} = decode_custom(
                Buffer.from(props["ServiceData"][sensorUuid])
            );
            console.log(
                `${sensorName.padEnd(12, " ")} → ${temp.toFixed(2)}C / ${(
                    humidity * 100
                ).toFixed(0)}%`
            );
            gauges.temp.set({sensor: sensorName}, temp);
            gauges.humidity.set({sensor: sensorName}, humidity);
            gauges.battery.set({sensor: sensorName}, battery_level);
        });
    } else if (!sensorName && !unknownDevices.has(address)) {
        console.log('ignoring unknown device: ', address);
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

const app = express();

app.get('/metrics', async (_req:any, res:any) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err);
  }
});

app.listen(4001, '0.0.0.0');
