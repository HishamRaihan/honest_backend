// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for destinations
const Job = require('../models/job')

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
const requireOwnership = customErrors.requireOwnership

// this is middleware that will remove blank fields from `req.body`, e.g.
// { destination: { title: '', text: 'foo' } } -> { destination: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')
// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// INDEX
// GET /destinations practice
router.get('/jobs', (req, res, next) => {
  Job.find()
    // respond with status 200 and JSON of the destinations
    .then((jobs) => res.status(200).json({ jobs: jobs }))
    // if an error occurs, pass it to the handler
    .catch(next)
})
// INDEX One USERS POSTS
// GET /destinations practice
router.get('/jobs/owner', requireToken, (req, res, next) => {
  Job.find({ owner: req.user._id })// we added for users to only see what they created
    .then(jobs => {
      // `Posts` will be an array of Mongoose documents
      // we want to convert each one to a POJO, so we use `.map` to
      // apply `.toObject` to each one
      return jobs.map(post => post.toObject())
    })
    // respond with status 200 and JSON of the tasks
    .then(jobs => res.status(200).json({ jobs: jobs }))
    // if an error occurs, pass it to the handler
    .catch(next)
})
// SHOW
router.get('/jobs/:id', requireToken, (req, res, next) => {
  // req.params.id will be set based on the `:id` in the route
  Job.findById(req.params.id)
    .then(handle404)
    // if `findById` is succesful, respond with 200 and "job post" JSON
    .then((job) => res.status(200).json({ job: job.toObject() }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// CREATE

router.post('/jobs', requireToken, (req, res, next) => {
  // set owner of new destination to be current user
  req.body.job.owner = req.user.id
  // console.log(req.user.id)
  Job.create(req.body.job)
    // respond to succesful `create` with status 201 and JSON of new "destination"
    .then((job) => {
      res.status(201).json({ job: job.toObject() })
    })
    // if an error occurs, pass it off to our error handler
    // the error handler needs the error message and the `res` object so that it
    // can send an error message back to the client
    .catch(next)
})

// UPDATE
router.patch('/jobs/:id', requireToken, removeBlanks, (req, res, next) => {
  // if the client attempts to change the `owner` property by including a new
  // owner, prevent that by deleting that key/value pair
  delete req.body.job.owner

  Job.findById(req.params.id)
    .then(handle404)
    // ensure the signed in user (req.user.id) is the same as the example's owner (example.owner)
    .then(job => requireOwnership(req, job))
    // updating job object with jobData
    .then(job => job.updateOne(req.body.job))
    // if that succeeded, return 204 and no JSON
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// DESTROY
router.delete('/jobs/:id', requireToken, (req, res, next) => {
  Job.findById(req.params.id)
    .then(handle404)
    // ensure the signed in user (req.user.id) is the same as the destination's owner (destination.owner)
    .then((job) => requireOwnership(req, job))
    // delete destination from mongodb
    .then((job) => job.deleteOne())
    // send back 204 and no content if the deletion succeeded
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

module.exports = router
