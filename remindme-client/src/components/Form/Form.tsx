import * as React from 'react';
import { createStyles, withStyles } from '@material-ui/core/styles';
import { Grid, Typography, TextField, Button } from '@material-ui/core';
import * as dayjs from 'dayjs';
import Axios from 'axios';

const styles = createStyles({
    form: {
        textAlign: "center"
    },
    button:{
        marginTop: 20
    }
}); 

type FormProps = {
    // using `interface` is also ok
  };

type FormState = {
// using `interface` is also ok
    email: string,
    content: string,
    date: Date,
    errors: any,
    loading: boolean,
    successful: boolean
};

class Form extends React.Component<FormProps,FormState> {
    state: FormState = {
        email: '',
        content: '',
        date: new Date(),
        errors: {},
        loading: false,
        successful: false
    }

    private handleChange = (event:React.ChangeEvent<HTMLInputElement>) => {
        const name = event.target.name;
        const value = event.target.value;
        this.setState(
            (current) => ({...current,[name]:value})
        );
    }

    private handleSubmit = (event:React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        this.setState({loading:true,successful:false});
        const userData={
            mail:this.state.email,
            content:this.state.content,
            date:dayjs(this.state.date).toISOString()
        }
        Axios.post('https://us-central1-remindme-235611.cloudfunctions.net/api/jobs',userData)
        .then(
            (response) => {
            this.setState({loading:false,errors:{},successful:true,email:'',content:'',date:new Date()});
        })
        .catch(err => {
            this.setState({
                errors: err.response.data,
                loading: false
            })
        })
    }

    public render() {

        const { errors } = this.state;
        return (
            <Grid container className='form'>
                <Grid item sm>
                    <Typography variant="h4">
                        Enter information
                    </Typography>
                    <form noValidate onSubmit={this.handleSubmit}>
                    <TextField id="email" name="email" type="email" label="Email" value={this.state.email} helperText={errors.mail} error={errors.mail ? true : false} onChange={this.handleChange} fullWidth/>
                    <TextField id="content" name="content" type="content" label="Mail object" value={this.state.content} helperText={errors.content} error={errors.content ? true : false} onChange={this.handleChange} fullWidth/>
                    <TextField id="datetime-local" name="date" label="When to remind (your local time)" type="datetime-local" helperText={errors.date} error={errors.date ? true : false} value={dayjs(this.state.date).format('YYYY-MM-DDTHH:mm')} onChange={this.handleChange} InputLabelProps={{ shrink: true, }} fullWidth/>
                    <div className='button'>
                    <Button type="submit" variant = "contained" color="primary">Submit</Button>
                    {this.state.successful &&
                        'Mail registered successfully'
                    }
                    </div>
                    </form>
                </Grid>
                <Grid item sm/>
                <Grid item sm/>
            </Grid>
        );
    }
}

export default withStyles(styles)(Form);