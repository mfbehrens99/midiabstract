import { MidiController } from "../midiabstract/midi.js";
import { MidiButtonEntity, MidiBinaryLamp, MidiFaderEntity, MidiFaderMotorEntity, MidiEncoderEntity, MidiDimmerLampEntity } from "../midiabstract/midi_entities.js";

const named_buttons = [
    // "buttonEncoderDec15": 46,
    // "buttonEncoderInc15": 47,
    // "buttonEncoderDec16": 48,
    // "buttonEncoderInc16": 49,
    {name: "buttonMain", id: 50},
    {name: "buttonA",id: 84},
    {name: "buttonB",id: 85},
    {name: "buttonLoop",id: 86},
    {name: "buttonPrev",id: 91},
    {name: "buttonNext",id: 92},
    {name: "buttonStop",id: 93},
    {name: "buttonPlay",id: 94},
    {name: "buttonRec",id: 95},
    // "buttonTouchMain": 112,
]

export class XTouchCompactMidiController extends MidiController {
    constructor() {
        super({ name: "X-TOUCH COMPACT" })

        this.faders = [];
        this.buttons = [];
        this.buttons[0] = [];
        this.buttons[1] = [];
        this.buttons[2] = [];
        this.buttons[3] = [];
        for (let i = 0; i < 8; i++) {
            this.faders.push(new XTouchFader((i + 1), this, i));
            this.buttons[0].push(new XTouchButton("top_" + (i + 1), this, 8 + i));
            this.buttons[1].push(new XTouchButton("mih_" + (i + 1), this, 16 + i));
            this.buttons[2].push(new XTouchButton("mil_" + (i + 1), this, 24 + i));
            this.buttons[3].push(new XTouchButton("bot_" + (i + 1), this, i));
        }

        this.textButtons = {}
        named_buttons.map((item) => {
            this.textButtons[item.name] = new XTouchButton(item.name, this, item.id);
        });

        this.buttons[3].push(this.textButtons["buttonMain"]);

        var main_fader = new XTouchFader("main", this, 8);
        main_fader.touch = new MidiButtonEntity("touchmain", this, 112)
        this.faders.push(main_fader);

        this.encoders = [];
        for (let i = 0; i < 14; i++) {
            this.encoders.push(new XTouchEncoder((i + 1), this, i));
        }
    }

    reset_device() {
        this.output_device.send('sysex', [0xf0, 0x40, 0x41, 0x42, 0x59, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xF7])
        // TODO: Wait for response
        // {"bytes":[240,64,65,66,89,2,2,2,2,1,1,1,1,247],"_type":"sysex"}
    }
}

class XTouchFader {
    constructor(name, midi_device, id) {
        // TODO all IDs
        this.fader = new MidiFaderEntity(name, midi_device, id);
        this.motor = new MidiFaderMotorEntity(name, midi_device, id);
        this.touch = new MidiButtonEntity("touch" + name, midi_device, 104 + id);
    }

    set(...args) {
        this.motor.set(...args);
    }
}

class XTouchButton {
    constructor(name, midi_device, id) {
        // IDs
        this.button = new MidiButtonEntity(name, midi_device, id);
        this.lamp = new MidiBinaryLamp(name, midi_device, id);
    }

    set(...args) {
        this.lamp(...args);
    }
}

class XTouchEncoder {
    constructor(name, midi_device, id, mode) {
        this.encoder = new MidiEncoderEntity(name, midi_device, 16 + id);
        this.lamp = new XTouchEncoderLampEntity(name, midi_device, 48 + id, mode);
        this.button = new MidiButtonEntity("encoder" + name, midi_device, 32 + id);
    }

    set(...args) {
        this.lamp.set(...args);
    }
}

class XTouchEncoderLampEntity extends MidiDimmerLampEntity {
    constructor(name, midi_device, id, mode = "fan") {
        super(name, midi_device, id, "cc");
        this.mode = 0;
        this.setMode(mode);
    }

    setMode(mode) {
        switch (mode) {
            case "single":
                this.mode = 0;
                break;
            case "pan":
                this.mode = 1;
                break;
            case "fan":
                this.mode = 2;
                break;
            case "spread":
                this.mode = 3;
                break;
        }
    }

    float_to_raw_value(value) {
        if (value < 0) {
            return 0;
        }
        let raw_value = 1 + parseInt(value * 10) + 16 * this.mode;
        return raw_value;
    }
}
