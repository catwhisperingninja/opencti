import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Form, Formik, Field } from 'formik';
import { TextField } from 'formik-material-ui';
import Button from '@material-ui/core/Button';
import graphql from 'babel-plugin-relay/macro';
import { withRouter } from 'react-router-dom';
import { compose, head } from 'ramda';
import * as Yup from 'yup';
import * as PropTypes from 'prop-types';
import { commitMutation } from '../../relay/environment';
import inject18n from '../../components/i18n';

const styles = () => ({
  login: {
    paddingBottom: '15px',
  },
});

const loginMutation = graphql`
  mutation LoginFormMutation($input: UserLoginInput!) {
    token(input: $input)
  }
`;

const loginValidation = (t) => Yup.object().shape({
  email: Yup.string().required(t('This field is required')),
  password: Yup.string().required(t('This field is required')),
});

const LoginForm = (props) => {
  const { classes, t, demo } = props;
  const onSubmit = (values, { setSubmitting, setErrors }) => {
    commitMutation({
      mutation: loginMutation,
      variables: {
        input: values,
      },
      onError: (error) => {
        const errorMessage = props.t(head(error.res.errors).message);
        setErrors({ email: errorMessage });
        setSubmitting(false);
      },
      setSubmitting,
      onCompleted: () => {
        window.location.reload();
      },
    });
  };
  return (
    <div className={classes.login}>
      <Formik
        initialValues={{
          email: demo ? 'demo@opencti.io' : '',
          password: demo ? 'demo' : '',
        }}
        validationSchema={loginValidation(t)}
        onSubmit={onSubmit}
      >
        {({ isSubmitting }) => (
          <Form>
            <Field
              component={TextField}
              name="email"
              label={t('Login')}
              fullWidth={true}
            />
            <Field
              component={TextField}
              name="password"
              label={t('Password')}
              type="password"
              fullWidth={true}
              style={{ marginTop: 20 }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
              style={{ marginTop: 30 }}
            >
              {t('Sign in')}
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

LoginForm.propTypes = {
  classes: PropTypes.object,
  t: PropTypes.func,
  history: PropTypes.object,
  demo: PropTypes.bool,
};

export default compose(inject18n, withRouter, withStyles(styles))(LoginForm);
