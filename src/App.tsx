import { useRenderCount } from "@uidotdev/usehooks";
import { FormKitField, useFormKit } from "./hooks/useFormkit";
import * as yup from "yup";

interface Values extends FormKitField {
  firstName: string;
  lastName: string;
  status: boolean;
}

function App() {
  const inputClassName = "border border-gray-400 rounded p-1";
  const renderCount = useRenderCount();

  const { field, errors, isValid, handleSubmit } = useFormKit<Values>({
    initialValues: {
      firstName: "",
      lastName: "",
      status: false,
    },
    validationSchema: {
      firstName: yup.string().required(),
      lastName: yup.string().required(),
      status: yup.boolean().isTrue(),
    },
    onSubmit(values) {
      console.log("Submit", { values });
    },
  });

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <p className="font-bold">RenderCount: {renderCount}</p>
        <div className="flex flex-col gap-1">
          <label htmlFor="firstName">First Name</label>
          <input
            id="firstName"
            type="text"
            name="firstName"
            className={inputClassName}
            placeholder="text"
            {...field}
          />
          <p className="text-red-500 text-sm">{errors.firstName}</p>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="lastName">Last Name</label>
          <input
            id="lastName"
            type="text"
            name="lastName"
            className={inputClassName}
            placeholder="text"
            {...field}
          />
          <p className="text-red-500 text-sm">{errors.lastName}</p>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex flex-row items-center gap-1">
            <label htmlFor="status">status</label>
            <input type="checkbox" id="status" name="status" {...field} />
          </div>
          <p className="text-red-500 text-sm">{errors.status}</p>
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white border rounded-md py-2 disabled:bg-gray-500"
          disabled={!isValid}
        >
          <span>Submit</span>
        </button>
      </form>
    </div>
  );
}

export default App;
