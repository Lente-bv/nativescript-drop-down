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
import { backgroundColorProperty, colorProperty, fontInternalProperty, letterSpacingProperty, paddingBottomProperty, paddingLeftProperty, paddingRightProperty, paddingTopProperty, placeholderColorProperty, textAlignmentProperty, textDecorationProperty, textTransformProperty, Color, Font, Label, Length, Utils, } from "@nativescript/core";
import { hintProperty, itemsProperty, selectedIndexProperty, DropDownBase, DROP_DOWN_ITEM_CLASS, } from "./drop-down-common";
export * from "./drop-down-common";
const TOOLBAR_HEIGHT = 44;
const HINT_COLOR = new Color("#3904041E");
export class DropDown extends DropDownBase {
    createNativeView() {
        const dropDown = TNSDropDownLabel.initWithOwner(new WeakRef(this));
        dropDown.userInteractionEnabled = true;
        return dropDown;
    }
    initNativeView() {
        super.initNativeView();
        const nativeView = this.nativeViewProtected;
        const applicationFrame = UIScreen.mainScreen.applicationFrame;
        this._listPicker = UIPickerView.alloc().init();
        this._dropDownDelegate = DropDownListPickerDelegateImpl.initWithOwner(new WeakRef(this));
        this._dropDownDataSource = DropDownListDataSource.initWithOwner(new WeakRef(this));
        this._flexToolbarSpace = UIBarButtonItem.alloc().initWithBarButtonSystemItemTargetAction(5 /* FlexibleSpace */, null, null);
        this._doneTapDelegate = TapHandler.initWithOwner(new WeakRef(this));
        this._doneButton = UIBarButtonItem.alloc().initWithBarButtonSystemItemTargetAction(0 /* Done */, this._doneTapDelegate, "tap");
        this._accessoryViewVisible = true;
        this._toolbar = UIToolbar.alloc().initWithFrame(CGRectMake(0, 0, applicationFrame.size.width, TOOLBAR_HEIGHT));
        this._toolbar.autoresizingMask = 2 /* FlexibleWidth */;
        const nsArray = NSMutableArray.alloc().init();
        nsArray.addObject(this._flexToolbarSpace);
        nsArray.addObject(this._doneButton);
        this._toolbar.setItemsAnimated(nsArray, false);
        nativeView.inputView = this._listPicker;
        this._accessoryViewVisible = true;
        this._showHideAccessoryView();
        this._dropDownItemStyleLabel = new Label();
        this._dropDownItemStyleLabel.cssClasses.add(DROP_DOWN_ITEM_CLASS);
        this._addView(this._dropDownItemStyleLabel);
    }
    disposeNativeView() {
        this._doneTapDelegate = null;
        this._dropDownDelegate = null;
        this._dropDownDataSource = null;
        this.ios.inputView = null;
        this.ios.inputAccessoryView = null;
        this._listPicker = null;
        this._toolbar = null;
        this._doneButton = null;
        this._removeView(this._dropDownItemStyleLabel);
        super.disposeNativeView();
    }
    get ios() {
        return this.nativeViewProtected;
    }
    get accessoryViewVisible() {
        return this._accessoryViewVisible;
    }
    set accessoryViewVisible(value) {
        this._accessoryViewVisible = value;
        this._showHideAccessoryView();
    }
    onLoaded() {
        super.onLoaded();
        this._listPicker.delegate = this._dropDownDelegate;
        this._listPicker.dataSource = this._dropDownDataSource;
    }
    onUnloaded() {
        this._listPicker.delegate = null;
        this._listPicker.dataSource = null;
        super.onUnloaded();
    }
    open() {
        if (this.isEnabled) {
            this.ios.becomeFirstResponder();
        }
    }
    close() {
        this.ios.resignFirstResponder();
    }
    refresh() {
        if (!this._listPicker) {
            return;
        }
        this._listPicker.reloadAllComponents();
        // Coerce selected index after we have set items to native view.
        selectedIndexProperty.coerce(this);
    }
    [selectedIndexProperty.getDefault]() {
        return null;
    }
    [selectedIndexProperty.setNative](value) {
        if (value >= 0) {
            // HACK to fix #178
            setTimeout(() => {
                if (this._listPicker) { // Added in case the view gets destroyed in the mean time (see GH #224)
                    this._listPicker.selectRowInComponentAnimated(value, 0, true);
                }
            }, 1);
            this._listPicker.reloadAllComponents();
        }
        this.ios.setText(this._getItemAsString(value));
    }
    [itemsProperty.getDefault]() {
        return null;
    }
    [itemsProperty.setNative](value) {
        this.refresh();
    }
    [hintProperty.getDefault]() {
        return "";
    }
    [hintProperty.setNative](value) {
        this.ios.hint = value;
    }
    [colorProperty.getDefault]() {
        return this.nativeView.color;
    }
    [colorProperty.setNative](value) {
        const color = value instanceof Color ? value.ios : value;
        this.nativeView.color = color;
    }
    [placeholderColorProperty.getDefault]() {
        return this.nativeView.placeholderColor;
    }
    [placeholderColorProperty.setNative](value) {
        const color = value instanceof Color ? value.ios : value;
        this.nativeView.placeholderColor = color;
    }
    [backgroundColorProperty.getDefault]() {
        return this.nativeView.backgroundColor;
    }
    [backgroundColorProperty.setNative](value) {
        if (!value) {
            return;
        }
        const color = value instanceof Color ? value.ios : value;
        this.nativeView.backgroundColor = color;
    }
    [fontInternalProperty.getDefault]() {
        return this.nativeView.font;
    }
    [fontInternalProperty.setNative](value) {
        const font = value instanceof Font ? value.getUIFont(this.nativeView.font) : value;
        this.nativeView.font = font;
    }
    [textAlignmentProperty.setNative](value) {
        switch (value) {
            case "initial":
            case "left":
                this.nativeView.textAlignment = 0 /* Left */;
                break;
            case "center":
                this.nativeView.textAlignment = 1 /* Center */;
                break;
            case "right":
                this.nativeView.textAlignment = 2 /* Right */;
                break;
        }
    }
    [textDecorationProperty.setNative](value) {
        _setTextAttributes(this.nativeView, this.style);
    }
    [textTransformProperty.setNative](value) {
        _setTextAttributes(this.nativeView, this.style);
    }
    [letterSpacingProperty.setNative](value) {
        _setTextAttributes(this.nativeView, this.style);
    }
    [paddingTopProperty.setNative](value) {
        this._setPadding({ top: Utils.layout.toDeviceIndependentPixels(this.effectivePaddingTop) });
    }
    [paddingRightProperty.setNative](value) {
        this._setPadding({ right: Utils.layout.toDeviceIndependentPixels(this.effectivePaddingRight) });
    }
    [paddingBottomProperty.setNative](value) {
        this._setPadding({ bottom: Utils.layout.toDeviceIndependentPixels(this.effectivePaddingBottom) });
    }
    [paddingLeftProperty.setNative](value) {
        this._setPadding({ left: Utils.layout.toDeviceIndependentPixels(this.effectivePaddingLeft) });
    }
    eachChild(callback) {
        if (!this._dropDownItemStyleLabel) {
            return;
        }
        callback(this._dropDownItemStyleLabel);
    }
    _onCssStateChange() {
        super._onCssStateChange();
        if (!this._listPicker) {
            return;
        }
        this._listPicker.reloadAllComponents();
    }
    _setPadding(newPadding) {
        var _a, _b, _c, _d;
        const nativeView = this.nativeView;
        const padding = nativeView.padding;
        nativeView.padding = {
            top: (_a = newPadding.top) !== null && _a !== void 0 ? _a : padding.top,
            right: (_b = newPadding.right) !== null && _b !== void 0 ? _b : padding.right,
            bottom: (_c = newPadding.bottom) !== null && _c !== void 0 ? _c : padding.bottom,
            left: (_d = newPadding.left) !== null && _d !== void 0 ? _d : padding.left,
        };
    }
    _showHideAccessoryView() {
        this.ios.inputAccessoryView = (this._accessoryViewVisible ? this._toolbar : null);
    }
}
var TapHandler = /** @class */ (function (_super) {
    __extends(TapHandler, _super);
    function TapHandler() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TapHandler_1 = TapHandler;
    TapHandler.initWithOwner = function (owner) {
        var tapHandler = TapHandler_1.new();
        tapHandler._owner = owner;
        return tapHandler;
    };
    TapHandler.prototype.tap = function () {
        this._owner.get().close();
    };
    var TapHandler_1;
    __decorate([
        ObjCMethod()
    ], TapHandler.prototype, "tap", null);
    TapHandler = TapHandler_1 = __decorate([
        ObjCClass()
    ], TapHandler);
    return TapHandler;
}(NSObject));
var DropDownListDataSource = /** @class */ (function (_super) {
    __extends(DropDownListDataSource, _super);
    function DropDownListDataSource() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DropDownListDataSource_1 = DropDownListDataSource;
    DropDownListDataSource.initWithOwner = function (owner) {
        var dataSource = DropDownListDataSource_1.new();
        dataSource._owner = owner;
        return dataSource;
    };
    DropDownListDataSource.prototype.numberOfComponentsInPickerView = function (pickerView) {
        return 1;
    };
    DropDownListDataSource.prototype.pickerViewNumberOfRowsInComponent = function (pickerView, component) {
        var owner = this._owner.get();
        return (owner && owner.items) ? owner.items.length : 0;
    };
    var DropDownListDataSource_1;
    DropDownListDataSource = DropDownListDataSource_1 = __decorate([
        ObjCClass(UIPickerViewDataSource)
    ], DropDownListDataSource);
    return DropDownListDataSource;
}(NSObject));
var DropDownListPickerDelegateImpl = /** @class */ (function (_super) {
    __extends(DropDownListPickerDelegateImpl, _super);
    function DropDownListPickerDelegateImpl() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DropDownListPickerDelegateImpl_1 = DropDownListPickerDelegateImpl;
    DropDownListPickerDelegateImpl.initWithOwner = function (owner) {
        var delegate = DropDownListPickerDelegateImpl_1.new();
        delegate._owner = owner;
        return delegate;
    };
    DropDownListPickerDelegateImpl.prototype.pickerViewViewForRowForComponentReusingView = function (pickerView, row, component, view) {
        // NOTE: Currently iOS sends the reusedView always as null, so no reusing is possible
        var owner = this._owner.get();
        owner._dropDownItemStyleLabel._goToVisualState(row === owner.selectedIndex ? "selected" : "normal");
        var style = owner._dropDownItemStyleLabel.style;
        var label = TNSLabel.alloc().init();
        label.text = owner._getItemAsString(row);
        // Copy Styles
        if (style.color) {
            label.textColor = style.color.ios;
        }
        if (style.backgroundColor) {
            label.backgroundColor = style.backgroundColor.ios;
            if (row !== owner.selectedIndex) {
                owner._listPicker.backgroundColor = style.backgroundColor.ios;
            }
        }
        label.padding = {
            top: Length.toDevicePixels(style.paddingTop, 0),
            right: Length.toDevicePixels(style.paddingRight, 0) + label.layoutMargins.right,
            bottom: Length.toDevicePixels(style.paddingBottom, 0),
            left: Length.toDevicePixels(style.paddingLeft, 0) + label.layoutMargins.left,
        };
        if (style.fontInternal) {
            label.font = style.fontInternal.getUIFont(label.font);
        }
        switch (style.textAlignment) {
            case "initial":
            case "left":
                label.textAlignment = NSTextAlignment.Left;
                break;
            case "center":
                label.textAlignment = NSTextAlignment.Center;
                break;
            case "right":
                label.textAlignment = NSTextAlignment.Right;
                break;
        }
        _setTextAttributes(label, style);
        return label;
    };
    DropDownListPickerDelegateImpl.prototype.pickerViewDidSelectRowInComponent = function (pickerView, row, component) {
        var owner = this._owner.get();
        if (owner) {
            var oldIndex = owner.selectedIndex;
            owner.selectedIndex = row;
            if (row !== oldIndex) {
                owner.notify({
                    eventName: DropDownBase.selectedIndexChangedEvent,
                    object: owner,
                    oldIndex: oldIndex,
                    newIndex: row,
                });
            }
        }
    };
    var DropDownListPickerDelegateImpl_1;
    DropDownListPickerDelegateImpl = DropDownListPickerDelegateImpl_1 = __decorate([
        ObjCClass(UIPickerViewDelegate)
    ], DropDownListPickerDelegateImpl);
    return DropDownListPickerDelegateImpl;
}(NSObject));
var TNSDropDownLabel = /** @class */ (function (_super) {
    __extends(TNSDropDownLabel, _super);
    function TNSDropDownLabel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TNSDropDownLabel_1 = TNSDropDownLabel;
    Object.defineProperty(TNSDropDownLabel.prototype, "inputView", {
        get: function () {
            return this._inputView;
        },
        set: function (value) {
            this._inputView = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TNSDropDownLabel.prototype, "inputAccessoryView", {
        get: function () {
            return this._inputAccessoryView;
        },
        set: function (value) {
            this._inputAccessoryView = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TNSDropDownLabel.prototype, "canBecomeFirstResponder", {
        get: function () {
            return true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TNSDropDownLabel.prototype, "canResignFirstResponder", {
        get: function () {
            return true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TNSDropDownLabel.prototype, "hint", {
        get: function () {
            return this._hint;
        },
        set: function (value) {
            var owner = this._owner.get();
            this._hint = value;
            if (!this._hasText) {
                this.text = value;
                _setTextAttributes(owner.nativeView, owner.style);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TNSDropDownLabel.prototype, "color", {
        get: function () {
            return this._internalColor;
        },
        set: function (value) {
            this._internalColor = value;
            this._refreshColor();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TNSDropDownLabel.prototype, "placeholderColor", {
        get: function () {
            return this._internalPlaceholderColor;
        },
        set: function (value) {
            this._internalPlaceholderColor = value;
            this._refreshColor();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TNSDropDownLabel.prototype, "itemsTextAlignment", {
        get: function () {
            return this._itemsTextAlignment;
        },
        set: function (value) {
            this._itemsTextAlignment = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TNSDropDownLabel.prototype, "itemsPadding", {
        get: function () {
            return this._itemsPadding;
        },
        set: function (value) {
            this._itemsPadding = value;
        },
        enumerable: true,
        configurable: true
    });
    TNSDropDownLabel.initWithOwner = function (owner) {
        var label = TNSDropDownLabel_1.new();
        label._owner = owner;
        label._isInputViewOpened = false;
        label.color = UIColor.blackColor;
        label.placeholderColor = HINT_COLOR.ios;
        label.text = " "; // HACK: Set the text to space so that it takes the necessary height if no hint/selected item
        label.addGestureRecognizer(UITapGestureRecognizer.alloc().initWithTargetAction(label, "tap"));
        label.userInteractionEnabled = true;
        return label;
    };
    TNSDropDownLabel.prototype.setText = function (value) {
        var actualText = value || this._hint || "";
        var owner = this._owner.get();
        this._hasText = !Utils.isNullOrUndefined(value) && value !== "";
        this.text = (actualText === "" ? " " : actualText); // HACK: If empty use <space> so the label does not collapse
        this._refreshColor();
        _setTextAttributes(owner.nativeView, owner.style);
    };
    TNSDropDownLabel.prototype.becomeFirstResponder = function () {
        var result = _super.prototype.becomeFirstResponder.call(this);
        if (result) {
            if (!this._isInputViewOpened) {
                var owner = this._owner.get();
                owner.notify({
                    eventName: DropDownBase.openedEvent,
                    object: owner,
                });
            }
            this._isInputViewOpened = true;
        }
        return result;
    };
    TNSDropDownLabel.prototype.resignFirstResponder = function () {
        var result = _super.prototype.resignFirstResponder.call(this);
        var owner = this._owner.get();
        if (result) {
            this._isInputViewOpened = false;
            owner.notify({
                eventName: DropDownBase.closedEvent,
                object: owner,
            });
        }
        return result;
    };
    TNSDropDownLabel.prototype.tap = function (sender) {
        if (sender.state === UIGestureRecognizerState.Ended) {
            var owner = this._owner.get();
            if (owner.isEnabled) {
                this.becomeFirstResponder();
            }
        }
    };
    TNSDropDownLabel.prototype._refreshColor = function () {
        this.textColor = (this._hasText ? this._internalColor : this._internalPlaceholderColor);
    };
    var TNSDropDownLabel_1;
    __decorate([
        ObjCMethod(),
        __param(0, ObjCParam(UITapGestureRecognizer))
    ], TNSDropDownLabel.prototype, "tap", null);
    TNSDropDownLabel = TNSDropDownLabel_1 = __decorate([
        ObjCClass()
    ], TNSDropDownLabel);
    return TNSDropDownLabel;
}(TNSLabel));
function _setTextAttributes(nativeView, style) {
    const attributes = new Map();
    switch (style.textDecoration) {
        case "none":
            break;
        case "underline":
            attributes.set(NSUnderlineStyleAttributeName, 1 /* Single */);
            break;
        case "line-through":
            attributes.set(NSStrikethroughStyleAttributeName, 1 /* Single */);
            break;
        case "underline line-through":
            attributes.set(NSUnderlineStyleAttributeName, 1 /* Single */);
            attributes.set(NSStrikethroughStyleAttributeName, 1 /* Single */);
            break;
    }
    if (style.letterSpacing !== 0) {
        attributes.set(NSKernAttributeName, style.letterSpacing * nativeView.font.pointSize);
    }
    if (nativeView.textColor && attributes.size > 0) {
        attributes.set(NSForegroundColorAttributeName, nativeView.textColor);
    }
    const text = Utils.isNullOrUndefined(nativeView.text) ? "" : nativeView.text.toString();
    let sourceString;
    switch (style.textTransform) {
        case "uppercase":
            sourceString = NSString.stringWithString(text).uppercaseString;
            break;
        case "lowercase":
            sourceString = NSString.stringWithString(text).lowercaseString;
            break;
        case "capitalize":
            sourceString = NSString.stringWithString(text).capitalizedString;
            break;
        default:
            sourceString = text;
    }
    if (attributes.size > 0) {
        const result = NSMutableAttributedString.alloc().initWithString(sourceString);
        result.setAttributesRange(attributes, { location: 0, length: sourceString.length });
        nativeView.attributedText = result;
    }
    else {
        // Clear attributedText or text won't be affected.
        nativeView.attributedText = undefined;
        nativeView.text = sourceString;
    }
}
