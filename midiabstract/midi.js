import EventEmitter from 'node:events';
import easymidi from 'easymidi';
import closestMatch from "closest-match";

//display all midi devices
console.log(easymidi.getInputs());
console.log(easymidi.getOutputs());




export class MidiController {
    constructor(config) {
        this.name = config.name;

        let all_in = easymidi.getInputs();
        let midi_in = closestMatch.closestMatch(this.name, all_in);
        let all_out = easymidi.getOutputs();
        let midi_out = closestMatch.closestMatch(this.name, all_out);
        console.log("Connection to input '" + midi_in + "' and output '" + midi_out + "'");

        this.input_device = new easymidi.Input(midi_in);
        this.output_device = new easymidi.Output(midi_out);

        this.event_emitter = new EventEmitter.EventEmitter();

        this.on_note_dict = {};
        this.on_cc_dict = {};
        this.on_pitch_dict = {};

        this.input_device.on("noteon", this.on_note.bind(this));
        this.input_device.on("cc", this.on_cc.bind(this));
        this.input_device.on("pitch", this.on_pitch.bind(this));
    }

    reset_device() {
        this.output_device.send('reset');
    }

    clear_output(output) {
        for (let i = 0; i < 128; i++) {
            this.output_device.send('noteon', { note: i, velocity: 0, channel: 0 });
            this.output_device.send('cc', { controller: i, value: 0, channel: 0 });
        }
        for (let i = 0; i < 16; i++) {
            this.output_device.send('pitch', { value: 0, channel: i });
        }
    }

    register(type, id, callback) {
        switch (type) {
            case "noteon":
                this.on_note_dict[id] = callback;
                break;
            case "cc":
                this.on_cc_dict[id] = callback;
                break;
            case "pitch":
                this.on_pitch_dict[id] = callback;
                break;
        }
    }

    // Events from input midi device
    on_note(midi) {
        let func = this.on_note_dict[midi.note];
        if (typeof func !== "function") {
            return;
        }
        func(midi);
    }

    on_cc(midi) {
        let func = this.on_cc_dict[midi.controller];
        // console.log(midi, this.on_cc_dict, func)
        if (typeof func !== "function") {
            return;
        }
        func(midi);
    }

    on_pitch(midi) {
        let func = this.on_pitch_dict[midi.channel];
        if (typeof func !== "function") {
            return;
        }
        func(midi);
    }

}
