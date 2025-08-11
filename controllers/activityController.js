import { Activity } from "../models/Activity.js";


export const createActivity = async (req, res) => {
    try {
    const {
      title,
      description,
      category,
      start_date,
      end_date,
      location,
      org_id,
      image,
      required_volunteers,
      requirements,
      tags,
      status,

      donation_include,
      target_amount
    } = req.body;

    // Create a new activity instance
    const activity = new Activity({
      title,
      description,
      category,
      start_date,
      end_date,
      location,
      image,
      required_volunteers,
      requirements,
      tags,
      status,
      org_id,

      donation_include,
      target_amount
    });

    // Save to DB
    const savedActivity = await activity.save();

    res.status(201).json({
      message: 'Activity created successfully',
      data: savedActivity
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to create activity',
      error: error.message
    });
  }
}


//all activities
export const getAllActivities = async (req, res) => {
  try {
    const activities = await Activity.find().populate('org_id', 'name email');

    res.status(200).json({
      message: 'Activities retrieved successfully',
      data: activities
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to retrieve activities',
      error: error.message
    });
  }
}

//activity detail
export const getActivityDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const activity = await Activity.findById(id).populate('org_id', 'name email');

    res.status(200).json({
      message: 'Activity retrieved successfully',
      data: activity
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to retrieve activity',
      error: error.message
    });
  }
}