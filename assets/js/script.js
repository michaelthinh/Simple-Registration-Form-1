// Validator function === Object

function Validator(options) {
    var selectorRules = {};

    // Function validate
    function validate(inputElement, rule) {
        var errorElement = inputElement.parentElement.querySelector(
            options.errorSelector
        );
        var errorMessage;
        // Get all rules of selector
        var rules = selectorRules[rule.selector];
        // Scan through each rule and check for error
        for (var i = 0; i < rules.length; i++) {
            errorMessage = rules[i](inputElement.value);
            // If there is an error, stop the loop
            if (errorMessage) {
                break;
            }
        }
        if (errorMessage) {
            errorElement.innerText = errorMessage;
            inputElement.parentElement.classList.add("invalid");
        } else {
            errorElement.innerText = "";
            inputElement.parentElement.classList.remove("invalid");
        }
        return !errorMessage;
    }

    // Get element of form which needed to validate
    var formElement = document.querySelector(options.form);

    if (formElement) {
        formElement.onsubmit = function (e) {
            e.preventDefault();
            var isFormValid = true;
            // Loop through rules and validate
            options.rules.forEach(function (rule) {
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement, rule);
                if (!isValid) {
                    isFormValid = false;
                }
            });

            if (isFormValid) {
                // Submit with javascript
                if (typeof options.onSubmit === "function") {
                    var enableInputs = formElement.querySelectorAll("[name]");
                    var formValues = Array.from(enableInputs).reduce(function (
                        values,
                        input
                    ) {
                        return (values[input.name] = input.value) && values;
                    },
                    {});
                    options.onSubmit(formValues);
                }
                // Submit with default behavior
                else {
                    formElement.submit();
                }
            }
        };
        // Loop through all rules and listen to events (blur, input, ...)
        options.rules.forEach(function (rule) {
            // First save all rules into selectorRules
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] = [rule.test];
            }
            var inputElement = formElement.querySelector(rule.selector);
            if (inputElement) {
                // When blur out of input
                inputElement.onblur = function () {
                    validate(inputElement, rule);
                };
                // When user types
                inputElement.oninput = function () {
                    var errorElement =
                        inputElement.parentElement.querySelector(
                            ".form-message"
                        );
                    errorElement.innerText = "";
                    inputElement.parentElement.classList.remove("invalid");
                };
            }
        });
    }
}

// All rules definition
// 1. When errors occurred, return message
// 2. When no err occurred, return undefined
Validator.isRequired = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            return value.trim()
                ? undefined
                : message || "Please fill in this field";
        },
    };
};

Validator.isEmail = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value)
                ? undefined
                : message || "This field must be email";
        },
    };
};

Validator.minLength = function (selector, min, message) {
    return {
        selector: selector,
        test: function (value) {
            return value.length >= min
                ? undefined
                : message || `Password must be at least ${min} characters`;
        },
    };
};

Validator.isConfirmed = function (selector, getValue, message) {
    return {
        selector: selector,
        test: function (value) {
            return value === getValue()
                ? undefined
                : message || "Confirmation password does not match password";
        },
    };
};
