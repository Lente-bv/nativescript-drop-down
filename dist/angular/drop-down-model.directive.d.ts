import { AfterViewInit, ElementRef } from "@angular/core";
import { BaseValueAccessor } from "@nativescript/angular";
import { View } from "@nativescript/core";
import * as i0 from "@angular/core";
export declare type SelectableView = {
    selectedIndex: number;
} & View;
/**
 * The accessor for setting a selectedIndex and listening to changes that is used by the
 * {@link NgModel} directives.
 *
 *  ### Example
 *  ```
 *  <DropDown [(ngModel)]="model.test">
 *  ```
 */
export declare class DropDownSelectedIndexValueAccessor extends BaseValueAccessor<SelectableView> implements AfterViewInit {
    private _normalizedValue;
    private viewInitialized;
    constructor(elementRef: ElementRef);
    writeValue(value: any): void;
    ngAfterViewInit(): void;
    static ɵfac: i0.ɵɵFactoryDef<DropDownSelectedIndexValueAccessor, never>;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<DropDownSelectedIndexValueAccessor, "DropDown[ngModel], DropDown[formControl], DropDown[formControlName], dropDown[ngModel], dropDown[formControl], dropDown[formControlName], drop-down[ngModel], drop-down[formControl], drop-down[formControlName]", never, {}, {}, never>;
}
