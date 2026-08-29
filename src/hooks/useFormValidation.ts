import { useState, useCallback } from 'react';

/**
 * useFormValidation
 * ─────────────────────────────────────────────────────────────────────────────
 * Generic hook for controlled-form state + field-level validation.
 *
 * @param {Object} initialValues  - { fieldName: initialValue, ... }
 * @param {Object} validationRules - { fieldName: (value, allValues) => errorString | '' }
 *
 * @returns {{
 *   values: Object,
 *   errors: Object,
 *   touched: Object,
 *   handleChange: Function,
 *   handleBlur: Function,
 *   setFieldValue: Function,
 *   validate: Function,
 *   reset: Function,
 *   isValid: boolean,
 * }}
 *
 * Usage:
 *   const { values, errors, handleChange, validate } = useFormValidation(
 *     { email: '', password: '' },
 *     {
 *       email: (v) => (!v.includes('@') ? 'Invalid email' : ''),
 *       password: (v) => (v.length < 8 ? 'Min 8 characters' : ''),
 *     }
 *   );
 */
const useFormValidation = (initialValues = {}, validationRules = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  /** Validate a single field and return its error string (or '') */
  const validateField = useCallback(
    (name, value, allValues) => {
      const rule = validationRules[name];
      if (!rule) return '';
      return rule(value, allValues) || '';
    },
    [validationRules]
  );

  /** Validate all fields; returns true if no errors */
  const validate = useCallback(() => {
    const newErrors = {};
    Object.keys(validationRules).forEach((name) => {
      const err = validateField(name, values[name], values);
      if (err) newErrors[name] = err;
    });
    setErrors(newErrors);
    // Mark all fields as touched so errors become visible
    const allTouched = Object.keys(validationRules).reduce(
      (acc, k) => ({ ...acc, [k]: true }),
      {}
    );
    setTouched(allTouched);
    return Object.keys(newErrors).length === 0;
  }, [validateField, validationRules, values]);

  /** Called on <input onChange> */
  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      const newValue = type === 'checkbox' ? checked : value;

      setValues((prev) => {
        const updated = { ...prev, [name]: newValue };
        // Live-validate if field was already touched
        if (touched[name]) {
          const err = validateField(name, newValue, updated);
          setErrors((prev) => ({ ...prev, [name]: err }));
        }
        return updated;
      });
    },
    [touched, validateField]
  );

  /** Called on <input onBlur> — marks field as touched and validates it */
  const handleBlur = useCallback(
    (e) => {
      const { name } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));
      const err = validateField(name, values[name], values);
      setErrors((prev) => ({ ...prev, [name]: err }));
    },
    [validateField, values]
  );

  /** Programmatically set a single field value */
  const setFieldValue = useCallback(
    (name, value) => {
      setValues((prev) => {
        const updated = { ...prev, [name]: value };
        if (touched[name]) {
          const err = validateField(name, value, updated);
          setErrors((e) => ({ ...e, [name]: err }));
        }
        return updated;
      });
    },
    [touched, validateField]
  );

  /** Reset form to initial values */
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const isValid =
    Object.keys(errors).length === 0 &&
    Object.keys(validationRules).every((k) => touched[k]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setFieldValue,
    validate,
    reset,
    isValid,
  };
};

export default useFormValidation;
