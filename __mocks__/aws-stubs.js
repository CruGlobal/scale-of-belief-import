const fs = require('fs');
const path = require('path');

exports.listOpens = {
  'IsTruncated': true,
  'Contents': [
    {
      'Key': 'opens_20180729_040028.csv/',
      'LastModified': '2018-07-29T08:00:28.000Z',
      'ETag': '\'a65fd3aaa8c2ffd330bce58392c30a49-1\'',
      'Size': 1122,
      'StorageClass': 'STANDARD'
    },
    {
      'Key': 'opens_20180730_114200.csv',
      'LastModified': '2018-07-30T15:42:00.000Z',
      'ETag': '\'0fbe739fbbc464f673056f62b6a224e2-1\'',
      'Size': 720,
      'StorageClass': 'STANDARD'
    },
    {
      'Key': 'opens_20180730_040028.csv',
      'LastModified': '2018-07-30T08:00:28.000Z',
      'ETag': '\'0fbe739fbdc464f673056f62b6a224e2-1\'',
      'Size': 720,
      'StorageClass': 'STANDARD'
    }
  ],
  'Name': 'campaign-tests',
  'Prefix': 'opens',
  'MaxKeys': 5,
  'CommonPrefixes': [],
  'KeyCount': 5,
  'NextContinuationToken': '1xNewIeV7tIzPWdAHaFPOeGeTGRvcLfzJmcfkVkMIrBh1tYQzXNdZvknnE+9WhIwm',
  'StartAfter': ''
};

exports.listClicks = {
  'IsTruncated': true,
  'Contents': [
    {
      'Key': 'clicks_20180730_114200.csv',
      'LastModified': '2018-07-30T15:42:00.000Z',
      'ETag': '\'8770d73e35c9d5a6be18eaec3fa30284-1\'',
      'Size': 787,
      'StorageClass': 'STANDARD'
    },
    {
      'Key': 'clicks_20180729_040028.csv',
      'LastModified': '2018-07-29T08:00:28.000Z',
      'ETag': '\'caaba80f8247b175f55b6ffd094f46b6-1\'',
      'Size': 1262,
      'StorageClass': 'STANDARD'
    }
  ],
  'Name': 'campaign-tests',
  'Prefix': 'clicks',
  'MaxKeys': 5,
  'CommonPrefixes': [],
  'KeyCount': 5,
  'NextContinuationToken': '1xNewIeV7tIzPWdAHaFPOeGeTGRvcLfzJmcfkVkMIrBh1tYQzXNdZvknnE+9WhIwm',
  'StartAfter': ''
};

exports.getClicks = {
  Body: fs.readFileSync(path.join(__fixturesDir, 'campaign', 'clicks.csv'), 'utf-8')
}

exports.getOpens = {
  Body: fs.readFileSync(path.join(__fixturesDir, 'campaign', 'opens.csv'), 'utf-8')
}

exports.getOther = (fileName) => {
  return {
    Body: fs.readFileSync(path.join(__fixturesDir, 'campaign', fileName), 'utf-8')
  };
}