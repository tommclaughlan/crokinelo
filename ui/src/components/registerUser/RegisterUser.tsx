import React from "react";
import { useFormik } from "formik";
import { useQueryClient } from "react-query";
import { useFetchUsers, useRegisterUser } from "../../services/apiService";
import LoadingSpinner from "../loadingSpinner/LoadingSpinner";

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

    const formik = useFormik({
        initialValues: {
            username: "",
        },
        validate: (values) => {
            const errors: {
                username?: string;
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
                            </div>
                        </div>
                        {formik.errors.username ? (
                            <div className="text-accent-red text-center">
                                {formik.errors.username}
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
