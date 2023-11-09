import { useRef, useState } from "react";
import * as yup from "yup";
import _ from "lodash";

export type FormKitSchema<Values> = {
  [K in keyof Values]?: yup.AnySchema;
};

export type FormKitValue = string | boolean | null | undefined;

export type FormKitField = {
  [key: string]: FormKitValue;
};
export type FormKitErrors<Values> = {
  [K in keyof Values]?: string | undefined;
};

export interface FormKitConfig<Values> {
  initialValues: Values;
  validationSchema: FormKitSchema<Values>;
  isControlled?: boolean;
  onSubmit: (values: Values) => void;
}

export function useFormKit<Values extends FormKitField>({
  initialValues,
  validationSchema,
  isControlled = false,
  onSubmit,
}: FormKitConfig<Values>) {
  // Used to uncontrolled forms
  const formValuesRef = useRef<Values>(initialValues);
  // Used to controlled forms
  const [values, setValues] = useState<Values>(initialValues);
  //
  const [errors, setErrors] = useState<FormKitErrors<Values>>({});
  const [isValid, setIsValid] = useState(true);

  const validateField = async (field: keyof Values, value: FormKitValue) => {
    const schema = validationSchema[field];
    if (!schema) return Promise.resolve();

    return new Promise<void>((resolve, reject) => {
      schema
        .validate(value)
        .then(() => {
          if (errors[field]) {
            const _errors = { ...errors };
            delete _errors[field];
            if (_.isEmpty(_errors)) {
              setIsValid(true);
            }
            setErrors(_errors);
          }
          resolve();
        })
        .catch((error: yup.ValidationError) => {
          setErrors((prevErrors) => ({
            ...prevErrors,
            [field]: error.message,
          }));
          setIsValid(false);
          reject(error);
        });
    });
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    let fieldValue: FormKitValue;

    switch (type) {
      case "checkbox":
        fieldValue = checked;
        break;
      case "radio":
        fieldValue = value;
        break;
      default:
        fieldValue = value;
    }

    if (isControlled) {
      setValues((prevValues) => ({
        ...prevValues,
        [name as keyof Values]: fieldValue,
      }));
    } else {
      formValuesRef.current = {
        ...formValuesRef.current,
        [name as keyof Values]: fieldValue,
      };
    }

    validateField(name, fieldValue);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const promises = [];
    const data = isControlled ? values : formValuesRef.current;

    for (const key in data) {
      const schema = validationSchema[key];
      if (schema) {
        promises.push(validateField(key, data[key]));
      }
    }

    Promise.all(promises)
      .then(() => onSubmit(data))
      .catch(() => {});
  };

  return {
    field: {
      values: isControlled ? values : undefined,
      onChange,
    },
    errors,
    isValid,
    handleSubmit,
  };
}
