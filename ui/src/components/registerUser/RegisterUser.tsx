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
        <div className="flex w-screen h-screen flex-col items-center justify-center z-10">
            <div className="bg-white p-5 rounded-lg shadow-lg">
            <header className="">
                <p className="modal-card-title">Register User</p>
            </header>
            <section className="modal-card-body">
                <form>
                    <div className="field">
                        <label className="label">Username</label>
                        <div className="control">
                            <input
                                className="input"
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
                        <div className="has-text-centered has-text-danger">
                            {formik.errors.username}
                        </div>
                    ) : null}
                </form>
            </section>
            <footer className="modal-card-foot">
                <button
                    className="button is-success"
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
