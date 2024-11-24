import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { Subject } from 'rxjs';

import { GridService } from '../../services/grid.service';
import { GridSecretComponent } from './grid-secret.component';

describe('GridSecretComponent', () => {
    let component: GridSecretComponent,
        fixture: ComponentFixture<GridSecretComponent>,
        gridService: jasmine.SpyObj<GridService>,
        secretSubject: Subject<string>;

    beforeEach(async () => {
        secretSubject = new Subject<string>();
        gridService = jasmine.createSpyObj('GridService', ['getGrid', 'setBias', 'getPollingGrid'], {
            secret$: secretSubject.asObservable()
        });

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

    it('Should update secret when service emits new value', () => {
        secretSubject.next('42');
        fixture.detectChanges();
        expect(component.secret).toBe('42');
    });

    it('Should clean up subscription on destroy', () => {
        const unsubscribeSpy = spyOn(component['subscription'], 'unsubscribe');
        component.ngOnDestroy();
        expect(unsubscribeSpy).toHaveBeenCalled();
    });
});
