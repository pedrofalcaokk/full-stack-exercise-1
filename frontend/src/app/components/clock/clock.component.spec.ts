import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClockComponent } from './clock.component';

describe('ClockComponent', () => {
    let component: ClockComponent;
    let fixture: ComponentFixture<ClockComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ClockComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(ClockComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('Should create', () => {
        expect(component).toBeTruthy();
    });

    it('Should calculate correct rotations when timestamp changes', () => {
        const testDate = new Date('2024-01-01T10:30:45');
        component.timestamp = testDate.toISOString();
        component.ngOnChanges();

        expect(component.hourRotation).toBe('rotate(315deg)');
        expect(component.minuteRotation).toBe('rotate(180deg)');
        expect(component.secondRotation).toBe('rotate(270deg)');
    });

    it('Should format time string correctly', () => {
        const testDate = new Date('2024-01-01T15:05:30');
        component.timestamp = testDate.toISOString();
        component.ngOnChanges();

        expect(component.time).toBe('15:05:30');
    });

    it('Should initialize with 12 clock marks', () => {
        expect(component.clockMarks.length).toBe(12);
    });

    it('Should handle empty timestamp', () => {
        component.timestamp = '';
        component.ngOnChanges();

        expect(component.hourRotation).toBe('');
        expect(component.minuteRotation).toBe('');
        expect(component.secondRotation).toBe('');
        expect(component.time).toBe('');
    });
});
