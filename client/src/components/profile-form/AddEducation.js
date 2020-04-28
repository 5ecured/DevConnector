import React, { Fragment, useState } from 'react'
import { Link, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { addEducation } from '../../actions/profile'

const AddEducation = ({ addEducation, history }) => {
    const [formData, setFormData] = useState({
        school: '',
        degree: '',
        fieldofstudy: '',
        from: '',
        to: '',
        current: false,
        description: ''
    })

    const [toDateDisabled, toggleDisabled] = useState(false)

    const { school, degree, fieldofstudy, from, to, current, description } = formData

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value })

    return (
        <Fragment>
            <h1 class="large text-primary">
                Add Education
            </h1>
            <p class="lead">
                <i class="fas fa-code-branch"></i> Add any school/bootcamp that you have attended
            </p>
            <small>* = required field</small>
            <form class="form" onSubmit={e => {
                e.preventDefault()
                addEducation(formData, history)
            }}>
                <div class="form-group">
                    <input type="text" placeholder="* School or Bootcamp" name="school" value={school} onChange={onChange} required />
                </div>
                <div class="form-group">
                    <input type="text" placeholder="* Degree or Certificate" name="degree" value={degree} onChange={onChange} required />
                </div>
                <div class="form-group">
                    <input type="text" placeholder="Field of study" name="fieldofstudy" value={fieldofstudy} onChange={onChange} />
                </div>
                <div class="form-group">
                    <h4>From Date</h4>
                    <input type="date" name="from" onChange={onChange} value={from} />
                </div>
                <div class="form-group">
                    <p><input type="checkbox" name="current" checked={current} value={current} onChange={e => {
                        setFormData({ ...formData, current: !current })
                        toggleDisabled(!toDateDisabled)
                    }} />{' '} Current school</p>
                </div>
                <div class="form-group">
                    <h4>To Date</h4>
                    <input type="date" name="to" value={to} onChange={onChange} disabled={toDateDisabled ? 'disabled' : ''} />
                </div>
                <div class="form-group">
                    <textarea
                        name="description"
                        cols="30"
                        rows="5"
                        placeholder="Program Description"
                        value={description}
                        onChange={onChange}
                    ></textarea>
                </div>
                <input type="submit" value='Submit' class="btn btn-primary my-1" />
                <Link className="btn btn-light my-1" to="/dashboard">Go Back</Link>
            </form>
        </Fragment>
    )
}

export default connect(null, { addEducation })(withRouter(AddEducation))