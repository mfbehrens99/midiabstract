import LaunchpadMK2MidiController from "../midicontroller/launchpad.js";
import XTouchCompactMidiController from "../midicontroller/xtouch.js";

let lp = new LaunchpadMK2MidiController();
let xt = new XTouchCompactMidiController();

lp.clear_output();

// for (let i = 0; i < 127; i++) {
//     lp.output_device.send("cc", {controller: i, value:3, channel: 0});
// }

for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
        if (i == 8 && j == 0)
            continue;
        lp.buttons[j][i].lamp.set_hsv(i / 8, 1, j/8);
        lp.buttons[j][i].button.on('press', xt.faders[i].set.bind(xt.faders[i], (8 - j) / 8))
    }
}

xt.faders[0].fader.on("value", (value) => {
    console.log(parseInt(value*127));
    lp.buttons[0][0].lamp.send_value(parseInt(value*127));
    lp.buttons[1][0].lamp.send_value(parseInt(value*127));
})


for (let i = 0; i < 8; i++) {
    xt.encoders[i].lamp.set(i / 7);
    xt.buttons[1][i].lamp.set(true);
}