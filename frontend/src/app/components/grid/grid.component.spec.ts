import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { of, throwError } from 'rxjs';

import { GridService } from '../../services/grid.service';
import { GridResponse } from '../../types/grid.types';
import { BIAS_COOLDOWN, BIAS_DEBOUNCE, POLLING_INTERVAL } from '../../utils/constants';
import { GridComponent } from './grid.component';

describe('GridComponent', () => {
    const mockGridResponse: GridResponse = {
        values: [
            ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'],
            ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'],
            ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'],
            ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'],
            ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'],
            ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'],
            ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'],
            ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'],
            ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'],
            ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'],
        ],
        timestamp: '2024-01-01T00:00:12',
        secret: '55'
    };

    let component: GridComponent,
        fixture: ComponentFixture<GridComponent>,
        gridService: jasmine.SpyObj<GridService>;

    beforeEach(async () => {
        gridService = jasmine.createSpyObj('GridService', ['getGrid', 'setBias', 'getPollingGrid'], {
            secret$: of('55')
        });
        gridService.getGrid.and.returnValue(of(mockGridResponse));
        gridService.getPollingGrid.and.returnValue(of(mockGridResponse));

        await TestBed.configureTestingModule({
            imports: [GridComponent],
            providers: [
                { provide: GridService, useValue: gridService },
                provideHttpClient(),
                provideAnimationsAsync()
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(GridComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('Should create', () => {
        expect(component).toBeTruthy();
    });

    it('Should initialize with an empty grid and empty bias', () => {
        expect(component.grid.length).toEqual(10);
        expect(component.grid[0].length).toEqual(10);
        expect(component.biasControl.value).toEqual('');
    });

    it('Should generate the grid properly', () => {
        // Generate the grid
        component.startGridGeneration();

        // Check if all the components properties are set properly
        expect(component.grid).toEqual(mockGridResponse.values);
        expect(component.timestamp).toEqual(mockGridResponse.timestamp);
        expect(component.gridSubscription).toBeTruthy();
    });

    it('Should cleanup subscriptions on destroy', () => {
        // Create gridSubscription
        component.startGridGeneration();

        // Create biasSubscription
        component.biasControl.setValue('a');

        // Destroy the component
        component.ngOnDestroy();

        // Check if subscriptions are closed properly
        expect(component.gridSubscription.closed).toBeTrue();
        expect((component as any).biasSubscription.closed).toBeTrue();
    });

    it('Should respect debounce period when setting bias', fakeAsync(() => {
        const setBiasSpy = gridService.setBias.and.returnValue(of({ message: 'Bias set successfully' }));

        // Set the bias value
        component.biasControl.setValue('a');

        // verify that the setBias was not called immediately
        expect(setBiasSpy).not.toHaveBeenCalled();

        // Fast-forward 1 ms short of debounce period
        tick(BIAS_DEBOUNCE - 1);
        expect(setBiasSpy).not.toHaveBeenCalled();

        // Fast-forward the last ms
        tick(1);
        expect(setBiasSpy).toHaveBeenCalledWith('a');
    }));

    it('Should not call setBias when value changes to the previous one', fakeAsync(() => {
        const setBiasSpy = gridService.setBias.and.returnValue(of({ message: 'Bias set successfully' }));

        // Set the bias value
        component.biasControl.setValue('a');

        // Fast-forward debounce period
        tick(BIAS_DEBOUNCE);
        expect(setBiasSpy).toHaveBeenCalledTimes(1);

        // Set same value again
        component.biasControl.setValue('a');
        tick(BIAS_DEBOUNCE);

        // Verify that setBias was not called again
        expect(setBiasSpy).toHaveBeenCalledTimes(1);
    }));

    it('Should enforce cooldown period', fakeAsync(() => {
        const setBiasSpy = gridService.setBias.and.returnValue(of({ message: 'Bias set successfully' }));

        // Set the bias value
        component.biasControl.setValue('a');

        // Fast-forward debounce period
        tick(BIAS_DEBOUNCE);
        expect(setBiasSpy).toHaveBeenCalledTimes(1);
        expect(component.cooldownRemaining).toBe(BIAS_COOLDOWN / 1000);

        // Try to set bias again within the cooldown period
        component.biasControl.setValue('b');
        tick(BIAS_DEBOUNCE);
        expect(setBiasSpy).toHaveBeenCalledTimes(1);

        // Fast-forward to complete the cooldown period
        tick(BIAS_COOLDOWN);

        // Set the new bias
        component.biasControl.setValue('c');
        tick(BIAS_DEBOUNCE);
        expect(setBiasSpy).toHaveBeenCalledTimes(2);
        expect(setBiasSpy).toHaveBeenCalledWith('c');
    }));

    it('Should disable input during cooldown period and enable after', fakeAsync(() => {
        gridService.setBias.and.returnValue(of({ message: 'Bias set successfully' }));

        // Make sure the input is enabled initially
        expect(component.biasControl.enabled).toBeTrue();

        // Fast-forward debounce period
        component.biasControl.setValue('a');
        tick(BIAS_DEBOUNCE);

        // Make sure the input is disabled during cooldown period
        expect(component.biasControl.disabled).toBeTrue();

        // Make sure the input is enabled after cooldown period
        tick(BIAS_COOLDOWN);
        expect(component.biasControl.enabled).toBeTrue();
    }));

    it('Should correctly countdown during cooldown period', fakeAsync(() => {
        gridService.setBias.and.returnValue(of({ message: 'Bias set successfully' }));

        // Set initial bias
        component.biasControl.setValue('a');
        tick(BIAS_DEBOUNCE);

        // Initial cooldown should be 4 seconds
        expect(component.cooldownRemaining).toBe(4);

        // Check countdown after 1 second
        tick(1000);
        expect(component.cooldownRemaining).toBe(3);

        // Check countdown after 2 seconds
        tick(1000);
        expect(component.cooldownRemaining).toBe(2);

        // Check countdown after 3 seconds
        tick(1000);
        expect(component.cooldownRemaining).toBe(1);

        // Check countdown after 4 seconds
        tick(1000);
        expect(component.cooldownRemaining).toBe(0);
    }));

    it('Should handle grid service errors gracefully', fakeAsync(() => {
        gridService.getGrid.and.returnValue(throwError(() => new Error('Network error')));
        component.startGridGeneration();
        tick(POLLING_INTERVAL);
        expect(component.grid).toEqual(Array(10).fill(null).map(() => Array(10).fill('')));
    }));

    it('Should handle empty bias input correctly', fakeAsync(() => {
        const setBiasSpy = gridService.setBias.and.returnValue(of({ message: 'Bias cleared' }));
        component.biasControl.setValue('');
        tick(BIAS_DEBOUNCE);
        expect(setBiasSpy).toHaveBeenCalledWith('');
    }));

    it('Should update timestamp and secret code during polling', fakeAsync(() => {
        const updatedResponse = {
            ...mockGridResponse,
            timestamp: '2024-01-01T00:00:13',
            secret: '66'
        };

        gridService.getPollingGrid.and.returnValue(of(updatedResponse));
        component.startGridGeneration();
        tick();

        expect(component.timestamp).toBe(updatedResponse.timestamp);
    }));

    it('Should cleanup interval timer on component destroy', fakeAsync(() => {
        gridService.setBias.and.returnValue(of({ message: 'Bias set successfully' }));
        component.biasControl.setValue('a');
        tick(BIAS_DEBOUNCE);

        // Record initial cooldown
        const initialCooldown = component.cooldownRemaining;

        // Destroy component
        component.ngOnDestroy();

        // Advance time
        tick(1000);

        // Cooldown should not have decreased
        expect(component.cooldownRemaining).toBe(initialCooldown);
    }));

    it('Should handle rapid bias value changes correctly', fakeAsync(() => {
        const setBiasSpy = gridService.setBias.and.returnValue(of({ message: 'Bias set successfully' }));

        component.biasControl.setValue('a');
        tick(BIAS_DEBOUNCE / 2);
        component.biasControl.setValue('b');
        tick(BIAS_DEBOUNCE / 2);
        component.biasControl.setValue('c');
        tick(BIAS_DEBOUNCE);

        expect(setBiasSpy).toHaveBeenCalledTimes(1);
        expect(setBiasSpy).toHaveBeenCalledWith('c');
    }));
});
