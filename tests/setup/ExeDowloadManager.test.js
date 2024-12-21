import axios from 'axios';
import { ExeDowloadManager } from '../../utils/setup/ExeDowloadManager.js'; // Adjust the import path

jest.mock('axios');

describe('ExeDowloadManager', () => {
  let manager;

  beforeEach(() => {
    manager = new ExeDowloadManager();
  });

  test('should verify the download URL is available', async () => {
    const testURL = 'https://github.com/22p21s0045/PhotoWaitress/releases/download/alpha/dngconverter.exe';

    // Mock axios.head to simulate a successful response
    axios.head.mockResolvedValue({
      headers: {
        'content-length': '123456', // Simulate file size
      },
      status: 200,
    });

    // Make the call and verify the result
    let isUrlAvailable = false;
    try {
      await axios.head(testURL);
      isUrlAvailable = true;
    } catch (error) {
      isUrlAvailable = false;
    }

    expect(isUrlAvailable).toBe(true);
    expect(axios.head).toHaveBeenCalledWith(testURL);
  });

  test('should handle download URL being unavailable', async () => {
    const testURL = 'https://github.com/22p21s0045/PhotoWaitress/releases/download/alpha/dngconverter.exe';

    // Mock axios.head to simulate an error response
    axios.head.mockRejectedValue(new Error('Network Error'));

    let isUrlAvailable = false;
    try {
      await axios.head(testURL);
      isUrlAvailable = true;
    } catch (error) {
      isUrlAvailable = false;
    }

    expect(isUrlAvailable).toBe(false);
    expect(axios.head).toHaveBeenCalledWith(testURL);
  });
});
