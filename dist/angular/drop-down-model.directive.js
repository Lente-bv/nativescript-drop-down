import { forwardRef, Directive, ElementRef, } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { BaseValueAccessor } from "@nativescript/angular";
import * as i0 from "@angular/core";
const SELECTED_INDEX_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DropDownSelectedIndexValueAccessor),
    multi: true,
};
/**
 * The accessor for setting a selectedIndex and listening to changes that is used by the
 * {@link NgModel} directives.
 *
 *  ### Example
 *  ```
 *  <DropDown [(ngModel)]="model.test">
 *  ```
 */
export class DropDownSelectedIndexValueAccessor extends BaseValueAccessor {
    constructor(elementRef) {
        super(elementRef.nativeElement);
    }
    writeValue(value) {
        if (value === undefined || value === null || value === "") {
            this._normalizedValue = null;
        }
        else {
            this._normalizedValue = value;
        }
        if (this.viewInitialized) {
            this.view.selectedIndex = this._normalizedValue;
        }
    }
    ngAfterViewInit() {
        this.viewInitialized = true;
        this.view.selectedIndex = this._normalizedValue;
    }
}
DropDownSelectedIndexValueAccessor.ɵfac = function DropDownSelectedIndexValueAccessor_Factory(t) { return new (t || DropDownSelectedIndexValueAccessor)(i0.ɵɵdirectiveInject(i0.ElementRef)); };
DropDownSelectedIndexValueAccessor.ɵdir = i0.ɵɵdefineDirective({ type: DropDownSelectedIndexValueAccessor, selectors: [["DropDown", "ngModel", ""], ["DropDown", "formControl", ""], ["DropDown", "formControlName", ""], ["dropDown", "ngModel", ""], ["dropDown", "formControl", ""], ["dropDown", "formControlName", ""], ["drop-down", "ngModel", ""], ["drop-down", "formControl", ""], ["drop-down", "formControlName", ""]], hostBindings: function DropDownSelectedIndexValueAccessor_HostBindings(rf, ctx) { if (rf & 1) {
        i0.ɵɵlistener("selectedIndexChange", function DropDownSelectedIndexValueAccessor_selectedIndexChange_HostBindingHandler($event) { return ctx.onChange($event.value); });
    } }, features: [i0.ɵɵProvidersFeature([SELECTED_INDEX_VALUE_ACCESSOR]), i0.ɵɵInheritDefinitionFeature] });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(DropDownSelectedIndexValueAccessor, [{
        type: Directive,
        args: [{
                selector: "DropDown[ngModel], DropDown[formControl], DropDown[formControlName], dropDown[ngModel], dropDown[formControl], dropDown[formControlName], drop-down[ngModel], drop-down[formControl], drop-down[formControlName]",
                providers: [SELECTED_INDEX_VALUE_ACCESSOR],
                host: {
                    "(selectedIndexChange)": "onChange($event.value)",
                },
            }]
    }], function () { return [{ type: i0.ElementRef }]; }, null); })();
