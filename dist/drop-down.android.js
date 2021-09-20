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
import { backgroundColorProperty, colorProperty, fontInternalProperty, fontSizeProperty, placeholderColorProperty, textAlignmentProperty, textDecorationProperty, unsetValue, Color, Label, StackLayout, Utils, } from "@nativescript/core";
import { hintProperty, itemsProperty, selectedIndexProperty, DropDownBase, DROP_DOWN_ITEM_CLASS, } from "./drop-down-common";
export * from "./drop-down-common";
const LABELVIEWID = "spinner-label";
var RealizedViewType;
(function (RealizedViewType) {
    RealizedViewType[RealizedViewType["ItemView"] = 0] = "ItemView";
    RealizedViewType[RealizedViewType["DropDownView"] = 1] = "DropDownView";
})(RealizedViewType || (RealizedViewType = {}));
export class DropDown extends DropDownBase {
    constructor() {
        super(...arguments);
        this._realizedItems = [
            new Map(),
            new Map(),
        ];
    }
    createNativeView() {
        initializeTNSSpinner();
        const spinner = new TNSSpinner(new WeakRef(this));
        if (!this._androidViewId) {
            this._androidViewId = android.view.View.generateViewId();
        }
        spinner.setId(this._androidViewId);
        initializeDropDownAdapter();
        const adapter = new DropDownAdapter(new WeakRef(this));
        spinner.setAdapter(adapter);
        spinner.adapter = adapter;
        initializeDropDownItemSelectedListener();
        const itemSelectedListener = new DropDownItemSelectedListener(new WeakRef(this));
        spinner.setOnItemSelectedListener(itemSelectedListener);
        spinner.itemSelectedListener = itemSelectedListener;
        return spinner;
    }
    initNativeView() {
        super.initNativeView();
        const nativeView = this.nativeView;
        nativeView.adapter.owner = new WeakRef(this);
        nativeView.itemSelectedListener.owner = new WeakRef(this);
        // When used in templates the selectedIndex changed event is fired before the native widget is init.
        // So here we must set the inital value (if any)
        if (!Utils.isNullOrUndefined(this.selectedIndex)) {
            this.android.setSelection(this.selectedIndex + 1); // +1 for the hint first element
        }
    }
    disposeNativeView() {
        const nativeView = this.nativeView;
        nativeView.adapter.owner = null;
        nativeView.itemSelectedListener.owner = null;
        this._clearCache(1 /* DropDownView */);
        this._clearCache(0 /* ItemView */);
        super.disposeNativeView();
    }
    get android() {
        return this.nativeView;
    }
    open() {
        if (this.isEnabled) {
            this.nativeView.performClick();
        }
    }
    close() {
        this.nativeView.onDetachedFromWindowX();
    }
    refresh() {
        this._updateSelectedIndexOnItemsPropertyChanged(this.items);
        if (this.android && this.android.getAdapter()) {
            this.android.getAdapter().notifyDataSetChanged();
        }
        // Coerce selected index after we have set items to native view.
        selectedIndexProperty.coerce(this);
    }
    [backgroundColorProperty.setNative](value) {
        this._propagateStylePropertyToRealizedViews("backgroundColor", value, true);
    }
    [colorProperty.setNative](value) {
        if (!Utils.isNullOrUndefined(value)) {
            this._propagateStylePropertyToRealizedViews("color", value, false);
        }
    }
    [fontInternalProperty.setNative](value) {
        this._propagateStylePropertyToRealizedViews("fontInternal", value, true);
    }
    [fontSizeProperty.setNative](value) {
        if (!Utils.isNullOrUndefined(value)) {
            this._propagateStylePropertyToRealizedViews("fontSize", value, true);
        }
    }
    [hintProperty.getDefault]() {
        return "";
    }
    [hintProperty.setNative](value) {
        this.android.getAdapter().notifyDataSetChanged();
    }
    [itemsProperty.getDefault]() {
        return null;
    }
    [itemsProperty.setNative](value) {
        this._updateSelectedIndexOnItemsPropertyChanged(value);
        this.android.getAdapter().notifyDataSetChanged();
        // Coerce selected index after we have set items to native view.
        selectedIndexProperty.coerce(this);
    }
    [textDecorationProperty.getDefault]() {
        return "none";
    }
    [textDecorationProperty.setNative](value) {
        this._propagateStylePropertyToRealizedViews("textDecoration", value, true);
    }
    [textAlignmentProperty.getDefault]() {
        return "left";
    }
    [textAlignmentProperty.setNative](value) {
        this._propagateStylePropertyToRealizedViews("textAlignment", value, true);
    }
    [placeholderColorProperty.setNative](value) {
        this._propagateStylePropertyToRealizedViews("placeholderColor", value, true);
    }
    [selectedIndexProperty.getDefault]() {
        return null;
    }
    [selectedIndexProperty.setNative](value) {
        const actualIndex = (Utils.isNullOrUndefined(value) ? 0 : value + 1);
        this.nativeView.setSelection(actualIndex);
    }
    eachChild(callback) {
        const realizedItems = this._realizedItems;
        for (const item of realizedItems) {
            item.forEach(callback);
        }
    }
    _getRealizedView(convertView, realizedViewType) {
        if (!convertView) {
            const view = new Label();
            const layout = new StackLayout();
            layout.style.horizontalAlignment = "stretch";
            view.id = LABELVIEWID;
            layout.addChild(view);
            return layout;
        }
        return this._realizedItems[realizedViewType].get(convertView);
    }
    _clearCache(realizedViewType) {
        const realizedItems = this._realizedItems[realizedViewType];
        realizedItems.forEach((view) => {
            if (view.parent) {
                view.parent._removeView(view);
            }
        });
        realizedItems.clear();
    }
    _propagateStylePropertyToRealizedViews(property, value, isIncludeHintIn = true) {
        this._realizedItems[0 /* ItemView */].forEach((view) => {
            if (isIncludeHintIn || !view.isHintViewIn) {
                if (property === "textDecoration"
                    || property === "placeholderColor") {
                    const label = view.getViewById(LABELVIEWID);
                    label.style[property] = value;
                    if (property === "placeholderColor" && view.isHintViewIn) {
                        label.style.color = value;
                    }
                }
                else {
                    view.style[property] = value;
                }
            }
        });
    }
    _updateSelectedIndexOnItemsPropertyChanged(newItems) {
        let newItemsCount = 0;
        if (newItems && newItems.length) {
            newItemsCount = newItems.length;
        }
        if (newItemsCount === 0 || this.selectedIndex >= newItemsCount) {
            this.selectedIndex = null;
        }
    }
}
// tslint:disable-next-line: variable-name
let TNSSpinner;
function initializeTNSSpinner() {
    if (TNSSpinner) {
        return;
    }
    var TNSSpinnerImpl = /** @class */ (function (_super) {
    __extends(TNSSpinnerImpl, _super);
    function TNSSpinnerImpl(owner) {
        var _this = _super.call(this, owner.get()._context) || this;
        _this.owner = owner;
        _this._isOpenedIn = false;
        return global.__native(_this);
    }
    TNSSpinnerImpl.prototype.performClick = function () {
        var owner = this.owner.get();
        this._isOpenedIn = true;
        owner.notify({
            eventName: DropDownBase.openedEvent,
            object: owner,
        });
        return _super.prototype.performClick.call(this);
    };
    TNSSpinnerImpl.prototype.onWindowFocusChanged = function (hasWindowFocus) {
        _super.prototype.onWindowFocusChanged.call(this, hasWindowFocus);
        if (this._isOpenedIn && hasWindowFocus) {
            var owner = this.owner.get();
            owner.notify({
                eventName: DropDownBase.closedEvent,
                object: owner,
            });
            this._isOpenedIn = false;
        }
    };
    TNSSpinnerImpl.prototype.onDetachedFromWindowX = function () {
        _super.prototype.onDetachedFromWindow.call(this);
    };
    return TNSSpinnerImpl;
}(android.widget.Spinner));
    TNSSpinner = TNSSpinnerImpl;
}
// tslint:disable-next-line: variable-name
let DropDownAdapter;
function initializeDropDownAdapter() {
    if (DropDownAdapter) {
        return;
    }
    var DropDownAdapterImpl = /** @class */ (function (_super) {
    __extends(DropDownAdapterImpl, _super);
    function DropDownAdapterImpl(owner) {
        var _this = _super.call(this) || this;
        _this.owner = owner;
        return global.__native(_this);
    }
    DropDownAdapterImpl.prototype.isEnabled = function (i) {
        return i !== 0;
    };
    DropDownAdapterImpl.prototype.getCount = function () {
        // In some strange situations owner can become null (see #181)
        if (!this.owner) {
            return 0;
        }
        var owner = this.owner.get();
        return (owner && owner.items ? owner.items.length : 0) + 1; // +1 for the hint
    };
    DropDownAdapterImpl.prototype.getItem = function (i) {
        // In some strange situations owner can become null (see #181)
        if (!this.owner) {
            return "";
        }
        var owner = this.owner.get();
        if (i === 0) {
            return owner.hint;
        }
        var realIndex = i - 1;
        return owner._getItemAsString(realIndex);
    };
    DropDownAdapterImpl.prototype.getItemId = function (i) {
        return long(i);
    };
    DropDownAdapterImpl.prototype.hasStableIds = function () {
        return true;
    };
    DropDownAdapterImpl.prototype.getView = function (index, convertView, parent) {
        return this._generateView(index, convertView, parent, RealizedViewType.ItemView);
    };
    DropDownAdapterImpl.prototype.getDropDownView = function (index, convertView, parent) {
        return this._generateView(index, convertView, parent, RealizedViewType.DropDownView);
    };
    DropDownAdapterImpl.prototype._generateView = function (index, convertView, parent, realizedViewType) {
        // In some strange situations owner can become null (see #181)
        if (!this.owner) {
            return null;
        }
        var owner = this.owner.get();
        if (!owner) {
            return null;
        }
        var view = owner._getRealizedView(convertView, realizedViewType);
        if (view) {
            if (!view.parent) {
                if (realizedViewType === RealizedViewType.DropDownView) {
                    view.cssClasses.add(DROP_DOWN_ITEM_CLASS);
                }
                owner._addView(view);
                convertView = view.android;
            }
            var label = view.getViewById(LABELVIEWID);
            label.text = this.getItem(index);
            // Non-inherited properties need to be copied
            var parentStyle = realizedViewType === RealizedViewType.DropDownView ? view.style : owner.style;
            label.style.textDecoration = parentStyle.textDecoration;
            if (realizedViewType === RealizedViewType.DropDownView) {
                view._goToVisualState(owner.selectedIndex !== null && index === owner.selectedIndex + 1 ? "selected" : "normal");
            }
            view.isHintViewIn = false;
            view.height = "auto";
            label.style.color = unsetValue;
            // Hint View styles
            if (index === 0) {
                view.isHintViewIn = true;
                label.style.color = label.style.placeholderColor
                    ? label.style.placeholderColor
                    : new Color(255, 148, 150, 148);
                // HACK: if there is no hint defined, make the view in the drop down virtually invisible.
                if (realizedViewType === RealizedViewType.DropDownView
                    && (Utils.isNullOrUndefined(owner.hint) || owner.hint === "")) {
                    view.height = 1;
                }
                // END HACK
            }
            owner._realizedItems[realizedViewType].set(convertView, view);
        }
        return convertView;
    };
    return DropDownAdapterImpl;
}(android.widget.BaseAdapter));
    DropDownAdapter = DropDownAdapterImpl;
}
// tslint:disable-next-line: variable-name
let DropDownItemSelectedListener;
function initializeDropDownItemSelectedListener() {
    if (DropDownItemSelectedListener) {
        return;
    }
    var DropDownItemSelectedListenerImpl = /** @class */ (function (_super) {
    __extends(DropDownItemSelectedListenerImpl, _super);
    function DropDownItemSelectedListenerImpl(owner) {
        var _this = _super.call(this) || this;
        _this.owner = owner;
        return global.__native(_this);
    }
    DropDownItemSelectedListenerImpl.prototype.onItemSelected = function (parent, convertView, index, id) {
        var owner = this.owner.get();
        var oldIndex = owner.selectedIndex;
        var newIndex = (index === 0 ? null : index - 1);
        owner.selectedIndex = newIndex;
        if (newIndex !== oldIndex) {
            owner.notify({
                eventName: DropDownBase.selectedIndexChangedEvent,
                object: owner,
                oldIndex: oldIndex,
                newIndex: newIndex,
            });
            // Seems if the user does not select an item the control reuses the views on the next open.
            // So it should be safe to clear the cache once the user selects an item (and not when the dropdown is closed)
            owner._clearCache(RealizedViewType.DropDownView);
        }
    };
    DropDownItemSelectedListenerImpl.prototype.onNothingSelected = function () {
        /* Currently Not Needed */
    };
    DropDownItemSelectedListenerImpl = __decorate([
        Interfaces([android.widget.AdapterView.OnItemSelectedListener])
    ], DropDownItemSelectedListenerImpl);
    return DropDownItemSelectedListenerImpl;
}(java.lang.Object));
    DropDownItemSelectedListener = DropDownItemSelectedListenerImpl;
}
/* DropDownItemSelectedListener END */
