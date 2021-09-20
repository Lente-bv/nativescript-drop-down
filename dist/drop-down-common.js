/*! *****************************************************************************
Copyright (c) 2020 Tangra Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
***************************************************************************** */
import { addWeakEventListener, removeWeakEventListener, CoercibleProperty, CSSType, ObservableArray, Property, Utils, View, } from "@nativescript/core";
export const DROP_DOWN_ITEM_CLASS = "drop-down-item";
let DropDownBase = class DropDownBase extends View {
    _getItemAsString(index) {
        const items = this.items;
        if (!items) {
            return " ";
        }
        if (Utils.isNullOrUndefined(index)) {
            return null;
        }
        if (this.isValueListIn) {
            return items.getDisplay(index);
        }
        const item = this.isItemsSourceIn ? this.items.getItem(index) : this.items[index];
        return (item === undefined || item === null) ? index + "" : item + "";
    }
};
DropDownBase.openedEvent = "opened";
DropDownBase.closedEvent = "closed";
DropDownBase.selectedIndexChangedEvent = "selectedIndexChanged";
DropDownBase = __decorate([
    CSSType("DropDown")
], DropDownBase);
export { DropDownBase };
export class ValueList extends ObservableArray {
    getDisplay(index) {
        if (Utils.isNullOrUndefined(index)) {
            return null;
        }
        if (index < 0 || index >= this.length) {
            return "";
        }
        return super.getItem(index).display;
    }
    getValue(index) {
        if (Utils.isNullOrUndefined(index) || index < 0 || index >= this.length) {
            return null;
        }
        return super.getItem(index).value;
    }
    getIndex(value) {
        let loop;
        for (loop = 0; loop < this.length; loop++) {
            if (this.getValue(loop) === value) {
                return loop;
            }
        }
        return null;
    }
}
export const selectedIndexProperty = new CoercibleProperty({
    name: "selectedIndex",
    defaultValue: null,
    valueConverter: (v) => {
        if (v === undefined || v === null) {
            return null;
        }
        return parseInt(v, 10);
    },
    coerceValue: (target, value) => {
        const items = target.items;
        if (items && items.length !== 0) {
            const max = items.length - 1;
            if (value < 0) {
                value = 0;
            }
            if (value > max) {
                value = max;
            }
        }
        else {
            value = null;
        }
        return value;
    },
});
selectedIndexProperty.register(DropDownBase);
export const itemsProperty = new Property({
    name: "items",
    valueChanged: (target, oldValue, newValue) => {
        const getItem = newValue && newValue.getItem;
        const getDisplay = newValue && newValue.getDisplay;
        target.isItemsSourceIn = typeof getItem === "function";
        target.isValueListIn = typeof getDisplay === "function";
        if (oldValue instanceof ObservableArray) {
            removeWeakEventListener(oldValue, ObservableArray.changeEvent, target.refresh, target);
        }
        if (newValue instanceof ObservableArray) {
            addWeakEventListener(newValue, ObservableArray.changeEvent, target.refresh, target);
        }
    },
});
itemsProperty.register(DropDownBase);
export const hintProperty = new Property({
    name: "hint",
    defaultValue: "",
});
hintProperty.register(DropDownBase);
