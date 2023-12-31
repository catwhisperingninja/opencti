import React from 'react';
import { makeStyles } from '@mui/styles';
import { graphql, useMutation } from 'react-relay';
import { Close } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { FormikConfig } from 'formik/dist/types';
import { Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import Button from '@mui/material/Button';
import ColorPickerField from '../../../../components/ColorPickerField';
import { Theme } from '../../../../components/Theme';
import { useFormatter } from '../../../../components/i18n';
import TextField from '../../../../components/TextField';
import SwitchField from '../../../../components/SwitchField';
import { SettingsMessagesLine_settingsMessage$data } from './__generated__/SettingsMessagesLine_settingsMessage.graphql';

const useStyles = makeStyles<Theme>((theme) => ({
  header: {
    backgroundColor: theme.palette.background.nav,
    padding: '20px 20px 20px 60px',
  },
  buttons: {
    marginTop: theme.spacing(2),
    textAlign: 'right',
  },
  button: {
    marginLeft: theme.spacing(2),
  },
  container: {
    padding: '10px 20px 20px 20px',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    left: 5,
    color: 'inherit',
  },
}));

const settingsMessageEditionPatch = graphql`
  mutation SettingsMessageFormPatchMutation(
    $id: ID!
    $input: SettingsMessageInput!
  ) {
    settingsEdit(id: $id) {
      editMessage(input: $input) {
        messages {
          ...SettingsMessagesLine_settingsMessage
        }
      }
    }
  }
`;

const messageValidation = () => Yup.object().shape({
  message: Yup.string().required(),
  activated: Yup.boolean().required(),
  dismissible: Yup.boolean().required(),
  color: Yup.string().nullable(),
});

type SettingsMessageInput = Partial<
Pick<
SettingsMessagesLine_settingsMessage$data,
'id' | 'activated' | 'message' | 'dismissible'
>
>;

const SettingsMessageForm = ({
  settingsId,
  message,
  handleClose,
  creation = false,
}: {
  settingsId: string;
  message?: SettingsMessagesLine_settingsMessage$data;
  handleClose: () => void;
  creation?: boolean;
}) => {
  const { t } = useFormatter();
  const classes = useStyles();
  const [commit] = useMutation(settingsMessageEditionPatch);
  const onSubmit: FormikConfig<SettingsMessageInput>['onSubmit'] = (
    values,
    { setSubmitting },
  ) => {
    commit({
      variables: {
        id: settingsId,
        input: values,
      },
      onCompleted: () => {
        setSubmitting(false);
        handleClose();
      },
    });
  };
  const onReset = () => {
    handleClose();
  };
  const initialValues = message
    ? {
      id: message.id,
      message: message.message,
      activated: message.activated,
      dismissible: message.dismissible,
      color: message.color,
    }
    : {
      message: '',
      activated: false,
      dismissible: false,
      color: '',
    };
  return (
    <>
      <div className={classes.header}>
        <IconButton
          aria-label="Close"
          className={classes.closeButton}
          onClick={handleClose}
          size="large"
          color="primary"
        >
          <Close fontSize="small" color="primary" />
        </IconButton>
        <Typography variant="h6">
          {creation ? `${t('Create a message')}` : `${t('Update a message')}`}
        </Typography>
        <div className="clearfix" />
      </div>
      <div className={classes.container}>
        <Formik<SettingsMessageInput>
          enableReinitialize={true}
          initialValues={initialValues}
          validationSchema={messageValidation()}
          onSubmit={onSubmit}
          onReset={onReset}
        >
          {({ submitForm, handleReset, isSubmitting, isValid }) => (
            <Form style={{ margin: '20px 0 20px 0' }}>
              <Field
                component={TextField}
                variant="standard"
                name="message"
                label={t('Message')}
                fullWidth={true}
              />
              <Field
                component={ColorPickerField}
                name="color"
                label={t('Color')}
                fullWidth={true}
                style={{ marginTop: 20 }}
              />
              <Field
                component={SwitchField}
                type="checkbox"
                name="activated"
                label={t('Activated')}
                containerstyle={{ marginTop: 20 }}
              />
              <Field
                component={SwitchField}
                type="checkbox"
                name="dismissible"
                label={t('Dismissible')}
                containerstyle={{ marginTop: 10 }}
              />
              <div className={classes.buttons}>
                <Button
                  variant="contained"
                  onClick={handleReset}
                  disabled={isSubmitting}
                  classes={{ root: classes.button }}
                >
                  {t('Cancel')}
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={submitForm}
                  disabled={isSubmitting || !isValid}
                  classes={{ root: classes.button }}
                >
                  {creation ? `${t('Create')}` : `${t('Update')}`}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </>
  );
};

export default SettingsMessageForm;
