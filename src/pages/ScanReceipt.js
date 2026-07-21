import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  CameraAlt as CameraIcon,
  PhotoLibrary as GalleryIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { formatCurrency } from '../utils/dataUtils';

const ScanContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  paddingBottom: 70,
  minHeight: '100vh',
  backgroundColor: theme.palette.background.default
}));

const CameraSection = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(4),
  marginBottom: theme.spacing(3),
  height: 200,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100],
  border: `2px dashed ${theme.palette.divider}`
}));

const ActionButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1, 3),
}));

const ItemPaper = styled(Paper)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
}));

const ScanReceipt = () => {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [receiptItems, setReceiptItems] = useState([]);
  const [openItemDialog, setOpenItemDialog] = useState(false);
  const [currentItem, setCurrentItem] = useState({ name: '', price: '', quantity: 1 });
  const [editIndex, setEditIndex] = useState(-1);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const handleBackClick = () => {
    navigate(-1);
  };
  
  const simulateScan = () => {
    setScanning(true);
    
    // Simulate scanning process
    setTimeout(() => {
      setScanning(false);
      setProcessing(true);
      
      // Simulate processing and results
      setTimeout(() => {
        setProcessing(false);
        
        // Sample receipt items
        setReceiptItems([
          { name: 'Pizza', price: 12.99, quantity: 1 },
          { name: 'Soda', price: 2.49, quantity: 2 },
          { name: 'Garlic Bread', price: 4.99, quantity: 1 }
        ]);
        
        setSnackbar({
          open: true,
          message: 'Receipt scanned successfully!',
          severity: 'success'
        });
      }, 2000);
    }, 2000);
  };
  
  const handleOpenGallery = () => {
    // In a real app, this would open the device gallery
    simulateScan();
  };
  
  const handleAddItem = () => {
    setCurrentItem({ name: '', price: '', quantity: 1 });
    setEditIndex(-1);
    setOpenItemDialog(true);
  };
  
  const handleEditItem = (index) => {
    setCurrentItem(receiptItems[index]);
    setEditIndex(index);
    setOpenItemDialog(true);
  };
  
  const handleDeleteItem = (index) => {
    const newItems = [...receiptItems];
    newItems.splice(index, 1);
    setReceiptItems(newItems);
    
    setSnackbar({
      open: true,
      message: 'Item removed',
      severity: 'info'
    });
  };
  
  const handleDialogClose = () => {
    setOpenItemDialog(false);
  };
  
  const handleItemChange = (e) => {
    const { name, value } = e.target;
    setCurrentItem({
      ...currentItem,
      [name]: name === 'price' || name === 'quantity' ? 
        (value === '' ? '' : Number(value)) : value
    });
  };
  
  const handleSaveItem = () => {
    if (!currentItem.name || !currentItem.price) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error'
      });
      return;
    }
    
    const newItems = [...receiptItems];
    
    if (editIndex >= 0) {
      newItems[editIndex] = currentItem;
    } else {
      newItems.push(currentItem);
    }
    
    setReceiptItems(newItems);
    setOpenItemDialog(false);
    
    setSnackbar({
      open: true,
      message: editIndex >= 0 ? 'Item updated' : 'Item added',
      severity: 'success'
    });
  };
  
  const handleCreateExpense = () => {
    if (receiptItems.length === 0) {
      setSnackbar({
        open: true,
        message: 'Please add at least one item',
        severity: 'error'
      });
      return;
    }
    
    // In a real app, this would pass the receipt data to the add expense page
    navigate('/add-expense', { 
      state: { 
        receiptItems,
        total: receiptItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      } 
    });
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  const calculateTotal = () => {
    return receiptItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  return (
    <>
      <Header title="Scan Receipt" showBack onBackClick={handleBackClick} />
      
      <ScanContainer>
        <CameraSection>
          {scanning ? (
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress size={40} sx={{ mb: 2 }} />
              <Typography variant="body1">Scanning receipt...</Typography>
            </Box>
          ) : processing ? (
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress size={40} sx={{ mb: 2 }} />
              <Typography variant="body1">Processing receipt...</Typography>
            </Box>
          ) : receiptItems.length > 0 ? (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>Receipt Scanned</Typography>
              <Typography variant="body2" color="textSecondary">
                {receiptItems.length} items detected
              </Typography>
            </Box>
          ) : (
            <>
              <CameraIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="body1" gutterBottom>Scan your receipt</Typography>
              <Typography variant="body2" color="textSecondary" align="center">
                Position your receipt in the camera frame
              </Typography>
            </>
          )}
        </CameraSection>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <ActionButton
            variant="contained"
            color="primary"
            startIcon={<CameraIcon />}
            onClick={simulateScan}
            disabled={scanning || processing}
          >
            Scan Receipt
          </ActionButton>
          
          <ActionButton
            variant="outlined"
            startIcon={<GalleryIcon />}
            onClick={handleOpenGallery}
            disabled={scanning || processing}
          >
            From Gallery
          </ActionButton>
        </Box>
        
        {receiptItems.length > 0 && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Receipt Items</Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddItem}
                color="primary"
              >
                Add Item
              </Button>
            </Box>
            
            <List sx={{ mb: 3 }}>
              {receiptItems.map((item, index) => (
                <ItemPaper key={index} elevation={1}>
                  <ListItem>
                    <ListItemText
                      primary={item.name}
                      secondary={
                        <>
                          {formatCurrency(item.price)} × {item.quantity}
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Typography variant="body1" sx={{ mr: 2, fontWeight: 'medium' }}>
                        {formatCurrency(item.price * item.quantity)}
                      </Typography>
                      <IconButton edge="end" onClick={() => handleEditItem(index)} size="small">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton edge="end" onClick={() => handleDeleteItem(index)} size="small">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                </ItemPaper>
              ))}
            </List>
            
            <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: (theme) => theme.shape.borderRadius }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">Subtotal</Typography>
                <Typography variant="body1">{formatCurrency(calculateTotal())}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">Tax</Typography>
                <Typography variant="body1">{formatCurrency(0)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6">{formatCurrency(calculateTotal())}</Typography>
              </Box>
            </Paper>
            
            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              onClick={handleCreateExpense}
            >
              Create Expense
            </Button>
          </>
        )}
      </ScanContainer>
      
      {/* Add/Edit Item Dialog */}
      <Dialog open={openItemDialog} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editIndex >= 0 ? 'Edit Item' : 'Add Item'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Item Name"
            type="text"
            fullWidth
            value={currentItem.name}
            onChange={handleItemChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="price"
            label="Price"
            type="number"
            fullWidth
            value={currentItem.price}
            onChange={handleItemChange}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
            }}
          />
          <TextField
            margin="dense"
            name="quantity"
            label="Quantity"
            type="number"
            fullWidth
            value={currentItem.quantity}
            onChange={handleItemChange}
            inputProps={{ min: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleSaveItem} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      
      <BottomNavigation />
    </>
  );
};

export default ScanReceipt;