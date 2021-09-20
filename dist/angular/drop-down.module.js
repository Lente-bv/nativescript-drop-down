import { NgModule } from "@angular/core";
import { isKnownView, registerElement, } from "@nativescript/angular";
import { DropDownSelectedIndexValueAccessor } from "./drop-down-model.directive";
import { DropDown } from "../drop-down";
import * as i0 from "@angular/core";
export class DropDownModule {
}
DropDownModule.ɵmod = i0.ɵɵdefineNgModule({ type: DropDownModule });
DropDownModule.ɵinj = i0.ɵɵdefineInjector({ factory: function DropDownModule_Factory(t) { return new (t || DropDownModule)(); }, providers: [], imports: [[]] });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(DropDownModule, { declarations: [DropDownSelectedIndexValueAccessor], exports: [DropDownSelectedIndexValueAccessor] }); })();
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(DropDownModule, [{
        type: NgModule,
        args: [{
                declarations: [DropDownSelectedIndexValueAccessor],
                providers: [],
                imports: [],
                exports: [
                    DropDownSelectedIndexValueAccessor,
                ],
            }]
    }], null, null); })();
if (!isKnownView("DropDown")) {
    registerElement("DropDown", () => DropDown);
}
