const fs = require('fs');
const path = require('path');

exports.listOpens = {
  'IsTruncated': true,
  'Contents': [
    {
      'Key': 'opens_20180729_040028.csv.gz',
      'LastModified': '2018-07-29T08:00:28.000Z',
      'ETag': '\'a65fd3aaa8c2ffd330bce58392c30a49-1\'',
      'Size': 1122,
      'StorageClass': 'STANDARD'
    },
    {
      'Key': 'opens_20180730_114200.csv.gz',
      'LastModified': '2018-07-30T15:42:00.000Z',
      'ETag': '\'0fbe739fbbc464f673056f62b6a224e2-1\'',
      'Size': 720,
      'StorageClass': 'STANDARD'
    },
    {
      'Key': 'opens_20180730_040028.csv.gz',
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
      'Key': 'clicks_20180730_114200.csv.gz',
      'LastModified': '2018-07-30T15:42:00.000Z',
      'ETag': '\'8770d73e35c9d5a6be18eaec3fa30284-1\'',
      'Size': 787,
      'StorageClass': 'STANDARD'
    },
    {
      'Key': 'clicks_20180729_040028.csv.gz',
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

exports.listSubscriptions = {
  'IsTruncated': true,
  'Contents': [
    {
      'Key': 'subscriptions_20180730_114200.csv.gz',
      'LastModified': '2018-07-30T15:42:00.000Z',
      'ETag': '\'8770d73e35c9d3a6be18eaec3fa30284-1\'',
      'Size': 787,
      'StorageClass': 'STANDARD'
    },
    {
      'Key': 'subscriptions_20180729_040028.csv.gz',
      'LastModified': '2018-07-29T08:00:28.000Z',
      'ETag': '\'caaba80f8247b975f55b6ffd094f46b6-1\'',
      'Size': 1262,
      'StorageClass': 'STANDARD'
    }
  ],
  'Name': 'campaign-tests',
  'Prefix': 'subscriptions',
  'MaxKeys': 5,
  'CommonPrefixes': [],
  'KeyCount': 5,
  'NextContinuationToken': '1xNewIeV7tIzPWdAHaFPOeGeTGRvcLfzJmcfiVkMIrBh1tYQzXNdZvknnE+9WhIwm',
  'StartAfter': ''
};

exports.listUnsubscriptions = {
  'IsTruncated': true,
  'Contents': [
    {
      'Key': 'unsubscriptions_20180730_114200.csv.gz',
      'LastModified': '2018-07-30T15:42:00.000Z',
      'ETag': '\'8970d73e35c9d3a6be18eaec3fa30284-1\'',
      'Size': 787,
      'StorageClass': 'STANDARD'
    },
    {
      'Key': 'unsubscriptions_20180729_040028.csv.gz',
      'LastModified': '2018-07-29T08:00:28.000Z',
      'ETag': '\'cavba80f8247b975f55b6ffd094f46b6-1\'',
      'Size': 1262,
      'StorageClass': 'STANDARD'
    }
  ],
  'Name': 'campaign-tests',
  'Prefix': 'unsubscriptions',
  'MaxKeys': 5,
  'CommonPrefixes': [],
  'KeyCount': 5,
  'NextContinuationToken': '1xNewIeV7tIzPWdAXaFPOeGeTGRvcLfzJmcfiVkMIrBh1tYQzXNdZvknnE+9WhIwm',
  'StartAfter': ''
};

exports.getClicks = {
  Body: fs.readFileSync(path.join(__fixturesDir, 'campaign', 'clicks.csv.gz'))
};

exports.getOpens = {
  Body: fs.readFileSync(path.join(__fixturesDir, 'campaign', 'opens.csv.gz'))
};

exports.getSubscriptions = {
  Body: fs.readFileSync(path.join(__fixturesDir, 'campaign', 'subscriptions.csv.gz'))
};

exports.getUnsubscriptions = {
  Body: fs.readFileSync(path.join(__fixturesDir, 'campaign', 'unsubscriptions.csv.gz'))
};

exports.getOther = (fileName) => {
  try {
    return {
      Body: fs.readFileSync(path.join(__fixturesDir, 'campaign', fileName), 'utf-8')
    };
  } catch (error) {
    if (error.code === 'ENOENT') {
      return new Error('The specified key does not exist.');
    }
    throw error;
  }
};
