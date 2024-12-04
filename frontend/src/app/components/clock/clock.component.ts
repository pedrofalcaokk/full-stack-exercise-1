import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';

@Component({
    selector: 'app-clock',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './clock.component.html',
    styleUrl: './clock.component.scss'
})
export class ClockComponent implements OnChanges {
    @Input() timestamp: string = '';
    hourRotation: string = '';
    minuteRotation: string = '';
    secondRotation: string = '';
    clockMarks: number[] = Array(12).fill(0).map((_, i) => i);
    time: string = '';

    ngOnChanges() {
        if (this.timestamp) {
            const date = new Date(this.timestamp);
            const hours = date.getHours() % 12;
            const minutes = date.getMinutes();
            const seconds = date.getSeconds();

            this.hourRotation = `rotate(${(hours * 30) + (minutes / 2)}deg)`;
            this.minuteRotation = `rotate(${minutes * 6}deg)`;
            this.secondRotation = `rotate(${seconds * 6}deg)`;
            this.time = new Date(this.timestamp).toTimeString().split(' ')[0];
        }
    }
}
