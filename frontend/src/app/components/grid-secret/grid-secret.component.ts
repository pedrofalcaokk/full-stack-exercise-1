import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { GridService } from '../../services/grid.service';

@Component({
    selector: 'app-grid-secret',
    imports: [],
    templateUrl: './grid-secret.component.html',
    styleUrl: './grid-secret.component.scss'
})
export class GridSecretComponent implements OnInit {
    secret: string = '';
    private subscription: Subscription = new Subscription();

    constructor(private gridService: GridService) { }

    ngOnInit(): void {
        this.subscription = this.gridService.secret$.subscribe(
            secret => this.secret = secret
        );
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }
}
