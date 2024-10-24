import React from "react";
import { useFormik } from "formik";
import { useQueryClient } from "react-query";
import { useFetchUsers, useRegisterUser } from "../../services/apiService";
import LoadingSpinner from "../loadingSpinner/LoadingSpinner";
import Select from "react-select";

interface RegisterUserProps {
  setShowRegister: (isShown: boolean) => void;
}

function RegisterUser({ setShowRegister }: RegisterUserProps) {
  const queryClient = useQueryClient();

  const { data: users, isLoading: isUsersLoading } = useFetchUsers();

  const { mutate: registerUser, isLoading: isPostLoading } = useRegisterUser({
    onSuccess: (data) => {
      // TODO pull users out into a const
      queryClient.setQueryData("users", data);

      setShowRegister(false);
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const offices = ["Bristol", "Newcastle"];

  const formatOptions = (options: string[]) => {
    if (options) {
      const formattedOptions = options.map((elem) => {
        return {
          label: elem,
          value: elem,
        };
      });
      return formattedOptions;
    }
  };

  const formik = useFormik({
    initialValues: {
      username: "",
      userOffice: "",
    },
    validate: (values) => {
      const errors: {
        username?: string;
        userOffice?: string;
      } = {};

      if (
        users &&
        users.filter((e) => e.username === values.username).length > 0
      ) {
        errors.username = "Username must be unique";
      }

      if (values.username === "") {
        errors.username = "Username must not be empty";
      }

      if (!offices.includes(values.userOffice)) {
        errors.userOffice = "Why are you doing this";
      }

      if (values.userOffice === "") {
        errors.userOffice = "Please choose your home office";
      }

      return errors;
    },
    onSubmit: (values) => {
      registerUser(values);
    },
  });

  return (
    <div className="flex flex-col z-10">
      <div className="bg-white rounded-lg shadow-2xl">
        <header className="border-b border-secondary p-4">
          <p className="text-2xl">Register User</p>
        </header>
        <section className="p-4">
          <form>
            <div>
              <label className="text-lg font-bold p-2 pl-4">Username</label>
              <div className="p-4">
                <input
                  className="border border-secondary rounded-lg p-2"
                  name="username"
                  id="username"
                  type="text"
                  value={formik.values.username}
                  onChange={formik.handleChange}
                  maxLength={20}
                />
                <Select
                  className="border border-secondary rounded-md"
                  placeholder="Office"
                  options={formatOptions(offices)}
                  classNames={{
                    menuPortal: (state) => "z-50",
                  }}
                  menuPortalTarget={document.body}
                  onChange={(selected) => {
                    formik.setFieldValue("userOffice", selected?.value);
                  }}
                />
              </div>
            </div>
            {formik.errors.username ? (
              <div className="text-accent-red text-center">
                {formik.errors.username}
              </div>
            ) : null}
            {formik.errors.userOffice ? (
              <div className="text-accent-red text-center">
                {formik.errors.userOffice}
              </div>
            ) : null}
          </form>
        </section>
        <footer className="border-t border-secondary text-right">
          <button
            className="bg-primary text-white rounded-lg p-2 pl-6 pr-6 m-4"
            type="submit"
            onClick={formik.submitForm}
            disabled={isPostLoading || isUsersLoading}
          >
            {isPostLoading ? <LoadingSpinner size="small" /> : "Submit"}
          </button>
        </footer>
      </div>
    </div>
  );
}

export default RegisterUser;
