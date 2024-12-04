import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';

import { GridService } from '../../services/grid.service';
import { GridSecretComponent } from './grid-secret.component';
import { Subject } from 'rxjs';
import { POLLING_INTERVAL } from '../../utils/constants';

describe('GridSecretComponent', () => {
    let component: GridSecretComponent,
        fixture: ComponentFixture<GridSecretComponent>,
        gridService: jasmine.SpyObj<GridService>,
        secretSubject: Subject<string>;

    beforeEach(async () => {
        secretSubject = new Subject<string>();
        gridService = jasmine.createSpyObj('GridService', ['setBias', 'getPollingGrid', 'getPollingSecret']);
        gridService.getPollingSecret.and.returnValue(secretSubject);

        await TestBed.configureTestingModule({
            imports: [GridSecretComponent],
            providers: [
                { provide: GridService, useValue: gridService },
                provideHttpClient(),
                provideAnimations()
            ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(GridSecretComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('Should create', () => {
        expect(component).toBeTruthy();
    });

    it('Should update secret when service emits new value', fakeAsync(() => {
        component.ngOnInit();
        expect(component.secret).toBe('');

        secretSubject.next('34');
        tick();
        fixture.detectChanges();

        expect(component.secret).toBe('34');
    }));

    it('Should clean up subscription on destroy', () => {
        const unsubscribeSpy = spyOn(component['subscription'], 'unsubscribe');
        component.ngOnDestroy();
        expect(unsubscribeSpy).toHaveBeenCalled();
    });
});
